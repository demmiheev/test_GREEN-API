import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectCredentials } from '@/entities/session'
import { pollNotifications } from './pollNotifications'

export function useNotificationsPolling() {
  const dispatch = useAppDispatch()
  const credentials = useAppSelector(selectCredentials)

  useEffect(() => {
    if (!credentials) return
    const controller = new AbortController()
    void pollNotifications(dispatch, controller.signal)
    return () => controller.abort()
  }, [credentials, dispatch])
}
