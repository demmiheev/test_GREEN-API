const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})
const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(timestamp: number) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function isSameDay(a: number, b: number) {
  return startOfDay(a) === startOfDay(b)
}

export function formatTime(timestamp: number) {
  return timeFormatter.format(timestamp)
}

export function formatChatListDate(timestamp: number, now = Date.now()) {
  return isSameDay(timestamp, now) ? formatTime(timestamp) : shortDateFormatter.format(timestamp)
}

export function formatDaySeparator(timestamp: number, now = Date.now()) {
  const diffDays = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS)
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  const sameYear = new Date(timestamp).getFullYear() === new Date(now).getFullYear()
  return (sameYear ? dayMonthFormatter : fullDateFormatter).format(timestamp)
}
