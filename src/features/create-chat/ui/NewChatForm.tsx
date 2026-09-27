import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '@/app/store'
import { chatOpened } from '@/entities/chat'
import { getErrorMessage, useCheckAccountMutation } from '@/shared/api/greenApi'
import { formatPhone, isValidPhone, normalizePhone } from '@/shared/lib/phone'
import { Button, TextField } from '@/shared/ui'
import styles from './NewChatForm.module.css'

interface NewChatFormProps {
  onCreated: () => void
}

export function NewChatForm({ onCreated }: NewChatFormProps) {
  const dispatch = useAppDispatch()
  const [checkAccount, { isLoading }] = useCheckAccountMutation()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isValidPhone(phone)) {
      setError('Введите номер в международном формате, например +7 999 123-45-67')
      return
    }

    const normalized = normalizePhone(phone)
    try {
      // Входящие приходят с числовым chatId, поэтому чат заводится сразу под ним, а не под номером
      const account = await checkAccount(normalized).unwrap()
      if (!account.exist || !account.chatId) {
        setError('Этот номер не зарегистрирован в Telegram')
        return
      }
      dispatch(chatOpened({ id: account.chatId, name: formatPhone(normalized), phone: normalized }))
      onCreated()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Номер телефона получателя"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+7 999 123-45-67"
        autoFocus
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value)
          setError(null)
        }}
        error={error}
      />
      <Button type="submit" fullWidth loading={isLoading} disabled={!phone.trim()}>
        Создать чат
      </Button>
    </form>
  )
}
