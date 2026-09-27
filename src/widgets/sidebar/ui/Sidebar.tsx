import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { ChatListItem, chatSelected, selectActiveChatId, selectAllChats } from '@/entities/chat'
import { loggedOut, selectConnection, selectConnectionError } from '@/entities/session'
import { NewChatForm } from '@/features/create-chat'
import { Icon } from '@/shared/ui'
import styles from './Sidebar.module.css'

function ConnectionStatus() {
  const connection = useAppSelector(selectConnection)
  const error = useAppSelector(selectConnectionError)

  if (connection === 'online' || connection === 'idle') return null
  return (
    <p className={styles.connection} role="status">
      {connection === 'connecting' ? 'Соединение…' : `Нет соединения${error ? `: ${error}` : ''}`}
    </p>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const chats = useAppSelector(selectAllChats)
  const activeChatId = useAppSelector(selectActiveChatId)
  const [isCreating, setIsCreating] = useState(false)

  const handleSelect = useCallback((chatId: string) => dispatch(chatSelected(chatId)), [dispatch])

  const handleLogout = () => {
    if (window.confirm('Выйти? История чатов на этом устройстве будет удалена.')) {
      dispatch(loggedOut())
    }
  }

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        {isCreating ? (
          <>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Назад"
              onClick={() => setIsCreating(false)}
            >
              <Icon name="back" />
            </button>
            <h2 className={styles.title}>Новый чат</h2>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Чаты</h2>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Выйти"
              title="Выйти"
              onClick={handleLogout}
            >
              <Icon name="logout" />
            </button>
          </>
        )}
      </header>

      <ConnectionStatus />

      {isCreating ? (
        <NewChatForm onCreated={() => setIsCreating(false)} />
      ) : (
        <>
          {chats.length > 0 ? (
            <ul className={styles.list} aria-label="Список чатов">
              {chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  onSelect={handleSelect}
                />
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <p>Чатов пока нет</p>
              <p>Нажмите на карандаш, чтобы написать по номеру телефона</p>
            </div>
          )}
          <button
            type="button"
            className={styles.fab}
            aria-label="Новый чат"
            title="Новый чат"
            onClick={() => setIsCreating(true)}
          >
            <Icon name="edit" />
          </button>
        </>
      )}
    </aside>
  )
}
