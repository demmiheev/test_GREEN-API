import { Icon } from '@/shared/ui'
import type { MessageStatus } from '../model/types'
import styles from './MessageStatusIcon.module.css'

const LABELS: Record<MessageStatus, string> = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
}

export function MessageStatusIcon({ status }: { status: MessageStatus }) {
  const name =
    status === 'pending'
      ? 'clock'
      : status === 'failed'
        ? 'error'
        : status === 'sent'
          ? 'check'
          : 'checks'

  return (
    <span className={`${styles.status} ${styles[status]}`} title={LABELS[status]}>
      <Icon name={name} size={16} />
      <span className={styles.srOnly}>{LABELS[status]}</span>
    </span>
  )
}
