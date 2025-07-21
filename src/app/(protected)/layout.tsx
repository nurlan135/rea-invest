import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Providers } from '@/components/providers'
import { AutoLogoutProvider } from '@/components/auth/auto-logout-provider'
import { NavigationDebug } from '@/components/debug/navigation-debug'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <Providers>
      <AutoLogoutProvider timeoutMinutes={30} warningMinutes={5}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <div className="hidden md:block w-64">
              <Sidebar />
            </div>
            <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
          <NavigationDebug />
        </div>
      </AutoLogoutProvider>
    </Providers>
  )
}