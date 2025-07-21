import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { env } from './env-validation'
import { authLogger } from './auth-logger'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          authLogger.logError('Missing credentials in auth attempt')
          return null
        }

        const email = credentials.email.toLowerCase().trim()
        const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
        const userAgent = req?.headers?.['user-agent'] || 'unknown'

        authLogger.logLoginAttempt(email, ip as string, userAgent as string)

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.isActive) {
            const reason = !user ? 'User not found' : 'User inactive'
            authLogger.logLoginFailure(email, reason, ip as string, userAgent as string)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            authLogger.logLoginFailure(email, 'Invalid password', ip as string, userAgent as string)
            return null
          }

          authLogger.logLoginSuccess(user.id.toString(), email, ip as string, userAgent as string)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown auth error'
          authLogger.logError(errorMessage, { email, ip, userAgent })
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 saat (saniyə ilə)
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 saat (saniyə ilə)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        // Log successful token creation
        authLogger.logSessionRefresh(user.id, user.email!)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (user) {
        authLogger.logLoginSuccess(user.id!, user.email!)
        return true
      }
      return false
    }
  },
  events: {
    async signOut({ token, session }) {
      if (token) {
        authLogger.logLogout(token.id as string, token.email as string, 'Manual logout')
      } else if (session) {
        authLogger.logLogout(session.user.id, session.user.email, 'Session logout')
      }
    },
    async session({ session, token }) {
      // Disable session access logging to reduce noise
      // authLogger.logSessionRefresh(session.user.id, session.user.email)
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}