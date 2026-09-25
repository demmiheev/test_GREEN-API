// Хост кластера определяется первыми четырьмя цифрами idInstance; точный apiUrl есть в личном кабинете
export function suggestApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4)
  return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.greenapi.com` : ''
}

export function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.trim().replace(/\/+$/, '')
}

export function isValidApiUrl(apiUrl: string): boolean {
  try {
    const { protocol } = new URL(normalizeApiUrl(apiUrl))
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}
