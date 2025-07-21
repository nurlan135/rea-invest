'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'
import { useToastContext } from '@/components/providers/toast-provider'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const router = useRouter()
  
  // Safe toast context usage
  const toastContext = (() => {
    try {
      return useToastContext()
    } catch (error) {
      console.warn('Toast context not available:', error)
      return {
        toast: {
          success: (title: string, description?: string) => console.log('SUCCESS:', title, description),
          error: (title: string, description?: string) => console.error('ERROR:', title, description),
          warning: (title: string, description?: string) => console.warn('WARNING:', title, description),
          info: (title: string, description?: string) => console.info('INFO:', title, description)
        }
      }
    }
  })()
  
  const { toast } = toastContext

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rea-remember-email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Check rate limit on component mount and email change
  useEffect(() => {
    if (email) {
      checkRateLimit()
    }
  }, [email])

  // Update block time countdown
  useEffect(() => {
    if (blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          const newTime = prev - 1000
          if (newTime <= 0) {
            setRateLimited(false)
            return 0
          }
          return newTime
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [blockTimeRemaining])

  const checkRateLimit = async () => {
    try {
      const response = await fetch(`/api/auth/check-rate-limit?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setRateLimited(!data.allowed || data.blocked)
        setAttemptsRemaining(data.remaining)
        setBlockTimeRemaining(data.blockTimeRemaining)
      }
    } catch (error) {
      console.error('Rate limit check failed:', error)
    }
  }

  const recordAttempt = async (success: boolean) => {
    try {
      const response = await fetch('/api/auth/check-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, success })
      })
      if (response.ok) {
        const data = await response.json()
        setRateLimited(data.rateLimited || !data.allowed)
        setAttemptsRemaining(data.remaining)
        setBlockTimeRemaining(data.blockTimeRemaining)
        return data
      }
    } catch (error) {
      console.error('Rate limit record failed:', error)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rateLimited) {
      const minutes = Math.ceil(blockTimeRemaining / 60000)
      toast.error('Çox cəhd', `${minutes} dəqiqə sonra yenidən cəhd edin`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      const success = !result?.error
      await recordAttempt(success)

      if (result?.error) {
        const msg = attemptsRemaining <= 1 
          ? `Email və ya şifrə yanlışdır. Hesab bloklanacaq.` 
          : `Email və ya şifrə yanlışdır. ${attemptsRemaining - 1} cəhd qaldı.`
        setError(msg)
        toast.error('Giriş uğursuz', msg)
      } else {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rea-remember-email', email)
        } else {
          localStorage.removeItem('rea-remember-email')
        }

        toast.success('Giriş uğurlu', 'Sistem əsas səhifəyə yönləndirir')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = 'Giriş zamanı xəta baş verdi'
      setError(errorMsg)
      toast.error('Sistem xətası', errorMsg)
      await recordAttempt(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>REA Invest</CardTitle>
        <CardDescription>Sistemə daxil olmaq üçün məlumatlarınızı daxil edin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {rateLimited && (
            <Alert variant="destructive">
              <AlertDescription>
                Çox səhv cəhd. {Math.ceil(blockTimeRemaining / 60000)} dəqiqə sonra yenidən cəhd edin.
              </AlertDescription>
            </Alert>
          )}
          {attemptsRemaining < 5 && attemptsRemaining > 0 && !rateLimited && (
            <Alert variant="default">
              <AlertDescription>
                Diqqət: {attemptsRemaining} cəhd hüququnuz qaldı.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
            />
            <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
              Məni xatırla
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || rateLimited}>
            {isLoading ? 'Daxil olunur...' : rateLimited ? 'Bloklanıb' : 'Daxil ol'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}