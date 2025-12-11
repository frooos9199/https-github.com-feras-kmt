// Input validation and sanitization helpers

export function sanitizeString(input: string): string {
  // Remove any HTML tags and special characters that could be used for XSS
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export function validatePhone(phone: string): boolean {
  // Kuwait phone numbers (with or without +965)
  const phoneRegex = /^(\+965)?[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateCivilId(civilId: string): boolean {
  // Kuwait Civil ID is 12 digits
  const civilIdRegex = /^[0-9]{12}$/
  return civilIdRegex.test(civilId)
}

export function validateEmployeeId(employeeId: string): boolean {
  // Format: KMT-XXX where XXX is 3 digits
  const employeeIdRegex = /^KMT-[0-9]{3}$/
  return employeeIdRegex.test(employeeId)
}

export function sanitizeInput(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}
