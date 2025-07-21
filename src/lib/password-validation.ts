interface PasswordValidationResult {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
  feedback: string[]
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
  }
}

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'admin123', 'root', '12345678', '1234567890', 'welcome'
]

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const feedback: string[] = []
  let score = 0
  
  // Requirements check
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }

  // Length scoring
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push('Ən azı 8 simvol olmalıdır')
  }
  
  if (password.length >= 12) {
    score += 10
  }

  // Character variety scoring
  if (requirements.lowercase) {
    score += 15
  } else {
    feedback.push('Kiçik hərf (a-z) daxil etməlisiniz')
  }

  if (requirements.uppercase) {
    score += 15
  } else {
    feedback.push('Böyük hərf (A-Z) daxil etməlisiniz')
  }

  if (requirements.numbers) {
    score += 15
  } else {
    feedback.push('Rəqəm (0-9) daxil etməlisiniz')
  }

  if (requirements.symbols) {
    score += 15
  } else {
    feedback.push('Xüsusi simvol (!@#$%^&* və s.) daxil etməlisiniz')
  }

  // Common password penalty
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(0, score - 30)
    feedback.push('Çox geniş istifadə olunan şifrələrdən istifadə etməyin')
  }

  // Repetitive patterns penalty
  if (/(.)\1{2,}/.test(password)) { // 3 or more repeated characters
    score = Math.max(0, score - 15)
    feedback.push('Təkrarlanan simvolları azaldın')
  }

  // Sequential patterns penalty
  const sequential = ['123', 'abc', 'qwe', 'asd', 'zxc']
  if (sequential.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 10)
    feedback.push('Ardıcıl simvol kombinasiyalarından qaçının')
  }

  // Complexity bonus
  if (password.length >= 16 && Object.values(requirements).every(r => r)) {
    score += 10
    feedback.push('Mükəmməl güclü şifrə!')
  }

  // Determine strength
  let strength: PasswordValidationResult['strength']
  if (score >= 85) {
    strength = 'very-strong'
  } else if (score >= 70) {
    strength = 'strong'
  } else if (score >= 50) {
    strength = 'medium'
  } else {
    strength = 'weak'
  }

  const isValid = score >= 70 // Require strong password

  return {
    isValid,
    strength,
    score: Math.min(100, score),
    feedback,
    requirements
  }
}

export function getPasswordStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return 'text-green-600'
    case 'strong':
      return 'text-green-500'
    case 'medium':
      return 'text-yellow-500'
    case 'weak':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function getPasswordStrengthText(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return 'Çox güclü'
    case 'strong':
      return 'Güclü'
    case 'medium':
      return 'Orta'
    case 'weak':
      return 'Zəif'
    default:
      return 'Yoxlanılmadı'
  }
}