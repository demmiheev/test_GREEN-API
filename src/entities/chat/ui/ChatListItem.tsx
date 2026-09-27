import { memo } from 'react'
import { useAppSelector } from '@/app/store'
import { formatChatListDate } from '@/shared/lib/date'
import { Avatar } from '@/shared/ui'
import { selectLastMessage } from '../model/chatsSlice'
import type { Chat } from '../model/types'
import { MessageStatusIcon } from './MessageStatusIcon'
import styles from './ChatListItem.module.css'

interface ChatListItemProps {
  chat: Chat
  active: boolean
  onSelect: (chatId: string) => void
}

export const ChatListItem = memo(function ChatListItem({
  chat,
  active,
  onSelect,
}: ChatListItemProps) {
  const lastMessage = useAppSelector((state) => selectLastMessage(state, chat.id))

  return (
    <li>
      <button
        type="button"
        className={`${styles.item} ${active ? styles.active : ''}`}
        aria-current={active || undefined}
        onClick={() => onSelect(chat.id)}
      >
        <Avatar seed={chat.id} name={chat.name} />
        <span className={styles.body}>
          <span className={styles.row}>
            <span className={styles.name}>{chat.name}</span>
            <span className={styles.meta}>
              {lastMessage?.direction === 'outgoing' && (
                <MessageStatusIcon status={lastMessage.status} />
              )}
              {lastMessage && (
                <time dateTime={new Date(lastMessage.timestamp).toISOString()}>
                  {formatChatListDate(lastMessage.timestamp)}
                </time>
              )}
            </span>
          </span>
          <span className={styles.row}>
            <span className={styles.preview}>
              {lastMessage
                ? lastMessage.unsupported
                  ? 'Неподдерживаемое сообщение'
                  : lastMessage.text
                : 'Нет сообщений'}
            </span>
            {chat.unreadCount > 0 && (
              <span className={styles.badge} aria-label={`Непрочитанных: ${chat.unreadCount}`}>
                {chat.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  )
})
