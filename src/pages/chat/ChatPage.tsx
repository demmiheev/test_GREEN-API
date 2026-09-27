import { useAppSelector } from '@/app/store'
import { selectActiveChatId } from '@/entities/chat'
import { ChatWindow } from '@/widgets/chat-window'
import { Sidebar } from '@/widgets/sidebar'
import styles from './ChatPage.module.css'

export function ChatPage() {
  const hasActiveChat = useAppSelector(selectActiveChatId) !== null

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
