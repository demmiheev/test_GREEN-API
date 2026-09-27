import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAppDispatch } from '@/app/store'
import { Icon } from '@/shared/ui'
import { MAX_MESSAGE_LENGTH, sendTextMessage } from '../model/sendTextMessage'
import styles from './MessageComposer.module.css'

const MAX_TEXTAREA_HEIGHT = 200

export function MessageComposer({ chatId }: { chatId: string }) {
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = text.trim().length > 0

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [text])

  useLayoutEffect(() => {
    textareaRef.current?.focus()
  }, [chatId])

  const submit = () => {
    if (!canSend) return
    void dispatch(sendTextMessage(chatId, text))
    setText('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter во время набора через IME подтверждает ввод, а не отправляет сообщение
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          rows={1}
          placeholder="Сообщение"
          aria-label="Сообщение"
          maxLength={MAX_MESSAGE_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button type="submit" className={styles.send} disabled={!canSend} aria-label="Отправить">
        <Icon name="send" />
      </button>
    </form>
  )
}
