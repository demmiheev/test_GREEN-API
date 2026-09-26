import styles from './Avatar.module.css'

const GRADIENTS = [
  ['#ff885e', '#ff516a'],
  ['#ffcd6a', '#ffa85c'],
  ['#82b1ff', '#665fff'],
  ['#a0de7e', '#54cb68'],
  ['#53edd6', '#28c9b7'],
  ['#72d5fd', '#2a9ef1'],
  ['#e0a2f3', '#d669ed'],
] as const

function hash(value: string) {
  let result = 0
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) | 0
  return Math.abs(result)
}

function getInitials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return initials.toUpperCase() || '#'
}

interface AvatarProps {
  seed: string
  name: string
  size?: number
}

export function Avatar({ seed, name, size = 54 }: AvatarProps) {
  const [from, to] = GRADIENTS[hash(seed) % GRADIENTS.length]!

  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundImage: `linear-gradient(${from}, ${to})`,
      }}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}
