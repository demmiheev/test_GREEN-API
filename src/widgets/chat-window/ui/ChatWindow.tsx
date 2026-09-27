import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { chatSelected, selectActiveChat, selectChatMessages } from '@/entities/chat'
import { MessageComposer } from '@/features/send-message'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar, Icon } from '@/shared/ui'
import { MessageList } from './MessageList'
import styles from './ChatWindow.module.css'

export function ChatWindow() {
  const dispatch = useAppDispatch()
  const chat = useAppSelector(selectActiveChat)
  // Для пустого id селектор отдаёт один и тот же пустой массив, без лишних ререндеров
  const messages = useAppSelector((state) => selectChatMessages(state, chat?.id ?? ''))

  useEffect(() => {
    if (!chat) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(chatSelected(null))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chat, dispatch])

  if (!chat) {
    return (
      <section className={styles.window}>
        <div className={styles.placeholder}>
          <span>Выберите чат или создайте новый</span>
        </div>
      </section>
    )
  }

  const phone = chat.phone ? formatPhone(chat.phone) : null

  return (
    <section className={styles.window} aria-label={`Чат с ${chat.name}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="К списку чатов"
          onClick={() => dispatch(chatSelected(null))}
        >
          <Icon name="back" />
        </button>
        <Avatar seed={chat.id} name={chat.name} size={40} />
        <div className={styles.info}>
          <h2 className={styles.name}>{chat.name}</h2>
          {phone && phone !== chat.name && <p className={styles.subtitle}>{phone}</p>}
        </div>
      </header>

      <MessageList chatId={chat.id} messages={messages} />
      <MessageComposer chatId={chat.id} />
    </section>
  )
}
