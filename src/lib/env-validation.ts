import crypto from 'crypto'

interface RequiredEnvVars {
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
}

interface OptionalEnvVars {
  NODE_ENV?: string
  POSTGRES_HOST?: string
  POSTGRES_PORT?: string
  POSTGRES_DB?: string
  POSTGRES_USER?: string
  POSTGRES_PASSWORD?: string
}

function generateSecureSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

function validateEnvVars(): RequiredEnvVars & OptionalEnvVars {
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }

  const optionalVars = {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD
  }

  // Check required variables
  const missingVars: string[] = []
  const weakVars: string[] = []

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missingVars.push(key)
    }
  }

  // Validate NEXTAUTH_SECRET strength
  if (requiredVars.NEXTAUTH_SECRET) {
    if (requiredVars.NEXTAUTH_SECRET.length < 32) {
      weakVars.push('NEXTAUTH_SECRET - minimum 32 characters required')
    }
    if (requiredVars.NEXTAUTH_SECRET === 'your-secret-key-here-change-this-in-production') {
      weakVars.push('NEXTAUTH_SECRET - using default value, change in production!')
    }
  }

  // Validate DATABASE_URL format
  if (requiredVars.DATABASE_URL && !requiredVars.DATABASE_URL.startsWith('postgresql://')) {
    weakVars.push('DATABASE_URL - should be PostgreSQL connection string')
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    
    if (missingVars.includes('NEXTAUTH_SECRET')) {
      console.log('💡 Generate a secure NEXTAUTH_SECRET with:')
      console.log(`   NEXTAUTH_SECRET="${generateSecureSecret()}"`)
    }
    
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  if (weakVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Weak environment variables detected:')
    weakVars.forEach(warning => console.warn(`   - ${warning}`))
  }

  console.log('✅ Environment variables validated successfully')
  
  return { ...requiredVars, ...optionalVars } as RequiredEnvVars & OptionalEnvVars
}

// Lazy validation - only run when accessed
let cachedEnv: RequiredEnvVars & OptionalEnvVars | null = null

function getEnv() {
  if (!cachedEnv) {
    cachedEnv = validateEnvVars()
  }
  return cachedEnv
}

// Export validated env vars with lazy loading
export const env = new Proxy({} as RequiredEnvVars & OptionalEnvVars, {
  get(target, key: string) {
    const envVars = getEnv()
    return envVars[key as keyof typeof envVars]
  }
})

export { generateSecureSecret }