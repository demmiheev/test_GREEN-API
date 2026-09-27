import type { AppThunk } from '@/app/store'
import {
  messageSendFailed,
  messageSendStarted,
  messageSendSucceeded,
  selectAllMessages,
} from '@/entities/chat'
import { greenApi } from '@/shared/api/greenApi'

export const MAX_MESSAGE_LENGTH = 4096

function deliver(localId: string, chatId: string, text: string): AppThunk<Promise<void>> {
  return async (dispatch) => {
    try {
      const { idMessage } = await dispatch(
        greenApi.endpoints.sendMessage.initiate({ chatId, message: text }, { track: false }),
      ).unwrap()
      dispatch(messageSendSucceeded({ localId, idMessage }))
    } catch {
      dispatch(messageSendFailed({ localId }))
    }
  }
}

export function sendTextMessage(chatId: string, rawText: string): AppThunk<Promise<void>> {
  return async (dispatch) => {
    const text = rawText.trim()
    if (!text) return

    const localId = `local-${crypto.randomUUID()}`
    dispatch(messageSendStarted({ localId, chatId, text, timestamp: Date.now() }))
    await dispatch(deliver(localId, chatId, text))
  }
}

export function retryMessage(localId: string): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const message = selectAllMessages(getState()).find((m) => m.id === localId)
    if (!message || message.status !== 'failed') return

    dispatch(
      messageSendStarted({
        localId,
        chatId: message.chatId,
        text: message.text,
        timestamp: Date.now(),
      }),
    )
    await dispatch(deliver(localId, message.chatId, message.text))
  }
}
