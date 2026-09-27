import { useAppSelector } from '@/app/store'
import { selectActiveChatId } from '@/entities/chat'
import { useNotificationsPolling } from '@/features/receive-notifications'
import { ChatWindow } from '@/widgets/chat-window'
import { Sidebar } from '@/widgets/sidebar'
import styles from './ChatPage.module.css'

export function ChatPage() {
  const hasActiveChat = useAppSelector(selectActiveChatId) !== null
  useNotificationsPolling()

  return (
    <main className={`${styles.layout} ${hasActiveChat ? styles.chatOpen : ''}`}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <div className={styles.chat}>
        <ChatWindow />
      </div>
    </main>
  )
}
