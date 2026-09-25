export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`
  return digits
}

// E.164 допускает до 15 цифр, мобильных номеров короче 10 цифр не бывает
export function isValidPhone(input: string): boolean {
  const digits = normalizePhone(input)
  return digits.length >= 10 && digits.length <= 15
}

export function formatPhone(input: string): string {
  const digits = normalizePhone(input)
  const ru = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits)
  if (ru) return `+7 ${ru[1]} ${ru[2]}-${ru[3]}-${ru[4]}`
  return digits ? `+${digits}` : ''
}
