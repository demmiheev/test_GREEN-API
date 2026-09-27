import { memo } from 'react'
import { useAppDispatch } from '@/app/store'
import { MessageStatusIcon, type Message } from '@/entities/chat'
import { retryMessage } from '@/features/send-message'
import { formatTime } from '@/shared/lib/date'
import styles from './MessageBubble.module.css'

export const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const dispatch = useAppDispatch()
  const outgoing = message.direction === 'outgoing'

  return (
    <li className={`${styles.row} ${outgoing ? styles.outgoing : styles.incoming}`}>
      <div className={styles.bubble}>
        {message.unsupported ? (
          <span className={styles.unsupported}>
            Этот тип сообщений не поддерживается — откройте Telegram
          </span>
        ) : (
          <span className={styles.text}>{message.text}</span>
        )}
        <span className={styles.meta}>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {outgoing && <MessageStatusIcon status={message.status} />}
        </span>
      </div>
      {message.status === 'failed' && outgoing && (
        <button
          type="button"
          className={styles.retry}
          onClick={() => void dispatch(retryMessage(message.id))}
        >
          Повторить
        </button>
      )}
    </li>
  )
})
