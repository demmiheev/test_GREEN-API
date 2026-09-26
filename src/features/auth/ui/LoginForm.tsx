import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '@/app/store'
import { loggedIn } from '@/entities/session'
import {
  getErrorMessage,
  useGetStateInstanceMutation,
  type Credentials,
  type InstanceState,
} from '@/shared/api/greenApi'
import { isValidApiUrl, normalizeApiUrl, suggestApiUrl } from '@/shared/lib/apiUrl'
import { Button, TextField } from '@/shared/ui'
import styles from './LoginForm.module.css'

const INSTANCE_STATE_ERRORS: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован — привяжите аккаунт Telegram в личном кабинете',
  blocked: 'Аккаунт заблокирован',
  sleepMode: 'Инстанс в спящем режиме — проверьте подключение телефона',
  starting: 'Инстанс запускается, попробуйте через минуту',
  yellowCard: 'Отправка сообщений временно ограничена',
}

type Errors = Partial<Record<keyof Credentials | 'form', string>>

function validate(values: Credentials): Errors {
  const errors: Errors = {}
  if (!/^\d+$/.test(values.idInstance)) errors.idInstance = 'Только цифры'
  if (!values.apiTokenInstance) errors.apiTokenInstance = 'Обязательное поле'
  if (!isValidApiUrl(values.apiUrl))
    errors.apiUrl = 'Укажите адрес вида https://1234.api.greenapi.com'
  return errors
}

export function LoginForm() {
  const dispatch = useAppDispatch()
  const [checkInstance, { isLoading }] = useGetStateInstanceMutation()

  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [customApiUrl, setCustomApiUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  const apiUrl = customApiUrl ?? suggestApiUrl(idInstance)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const credentials: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: normalizeApiUrl(apiUrl),
    }
    const validationErrors = validate(credentials)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    try {
      const { stateInstance } = await checkInstance(credentials).unwrap()
      if (stateInstance !== 'authorized') {
        setErrors({ form: INSTANCE_STATE_ERRORS[stateInstance] ?? `Статус: ${stateInstance}` })
        return
      }
      dispatch(loggedIn(credentials))
    } catch (error) {
      setErrors({ form: getErrorMessage(error) })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="idInstance"
        name="idInstance"
        inputMode="numeric"
        autoComplete="username"
        autoFocus
        value={idInstance}
        onChange={(event) => setIdInstance(event.target.value)}
        error={errors.idInstance}
      />
      <TextField
        label="apiTokenInstance"
        name="apiTokenInstance"
        type="password"
        autoComplete="current-password"
        value={apiTokenInstance}
        onChange={(event) => setApiTokenInstance(event.target.value)}
        error={errors.apiTokenInstance}
      />
      <TextField
        label="apiUrl"
        name="apiUrl"
        type="url"
        placeholder="https://1234.api.greenapi.com"
        value={apiUrl}
        onChange={(event) => setCustomApiUrl(event.target.value)}
        error={errors.apiUrl}
        hint="Подставляется по idInstance, при необходимости скопируйте из личного кабинета"
      />

      {errors.form && (
        <p className={styles.formError} role="alert">
          {errors.form}
        </p>
      )}

      <Button type="submit" fullWidth loading={isLoading}>
        Войти
      </Button>
    </form>
  )
}
