import { Fragment, useLayoutEffect, useRef } from 'react'
import type { Message } from '@/entities/chat'
import { formatDaySeparator, isSameDay } from '@/shared/lib/date'
import { MessageBubble } from './MessageBubble'
import styles from './MessageList.module.css'

const STICK_THRESHOLD_PX = 120

export function MessageList({ chatId, messages }: { chatId: string; messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const lastMessage = messages.at(-1)

  useLayoutEffect(() => {
    stickToBottom.current = true
  }, [chatId])

  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container) return
    // Свои сообщения прокручивают вниз, даже если пользователь читает историю выше
    if (stickToBottom.current || lastMessage?.direction === 'outgoing') {
      container.scrollTop = container.scrollHeight
    }
  }, [chatId, messages.length, lastMessage?.direction])

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight
    stickToBottom.current = distance < STICK_THRESHOLD_PX
  }

  return (
    <div ref={scrollRef} className={styles.scroll} onScroll={handleScroll}>
      {messages.length === 0 ? (
        <div className={styles.empty}>
          <p>Сообщений пока нет</p>
          <p>Напишите что-нибудь, чтобы начать переписку</p>
        </div>
      ) : (
        <ol className={styles.list} aria-label="Сообщения" aria-live="polite">
          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const showDay = !previous || !isSameDay(previous.timestamp, message.timestamp)
            return (
              <Fragment key={message.id}>
                {showDay && (
                  <li className={styles.day} aria-hidden>
                    <span>{formatDaySeparator(message.timestamp)}</span>
                  </li>
                )}
                <MessageBubble message={message} />
              </Fragment>
            )
          })}
        </ol>
      )}
    </div>
  )
}
