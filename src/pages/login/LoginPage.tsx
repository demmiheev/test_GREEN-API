import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo} aria-hidden>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
            <path d="M3.4 20.4 20.85 12.92a1 1 0 0 0 0-1.84L3.4 3.6a.99.99 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
          </svg>
        </div>
        <h1 className={styles.title}>GREEN-API Chat</h1>
        <p className={styles.subtitle}>
          Введите данные инстанса Telegram из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
