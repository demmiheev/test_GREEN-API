import type { AppDispatch } from '@/app/store'
import { connectionChanged } from '@/entities/session'
import { getErrorMessage, greenApi } from '@/shared/api/greenApi'
import { notificationToAction } from './notificationToAction'

const MAX_RETRY_DELAY_MS = 30_000

export function getRetryDelay(failures: number) {
  return Math.min(1000 * 2 ** (failures - 1), MAX_RETRY_DELAY_MS)
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

export async function pollNotifications(dispatch: AppDispatch, signal: AbortSignal) {
  let failures = 0
  dispatch(connectionChanged({ status: 'connecting' }))

  while (!signal.aborted) {
    const request = dispatch(
      greenApi.endpoints.receiveNotification.initiate(undefined, { track: false }),
    )
    const abort = () => request.abort()
    signal.addEventListener('abort', abort)

    try {
      const notification = await request.unwrap()
      if (signal.aborted) break
      failures = 0
      dispatch(connectionChanged({ status: 'online' }))

      if (notification) {
        try {
          const action = notificationToAction(notification.body)
          if (action) dispatch(action)
        } catch (error) {
          // Битое уведомление не должно навсегда заблокировать очередь
          console.error('Failed to handle notification', notification, error)
        }
        // Если удаление не прошло, уведомление придёт повторно и отсеется по idMessage
        await dispatch(
          greenApi.endpoints.deleteNotification.initiate(notification.receiptId, { track: false }),
        ).unwrap()
      }
    } catch (error) {
      if (signal.aborted) break
      failures += 1
      dispatch(connectionChanged({ status: 'offline', error: getErrorMessage(error) }))
      await wait(getRetryDelay(failures), signal)
    } finally {
      signal.removeEventListener('abort', abort)
    }
  }
}
