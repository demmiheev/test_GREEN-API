import type { UnknownAction } from '@reduxjs/toolkit'
import { incomingMessageReceived, messageStatusUpdated, type MessageStatus } from '@/entities/chat'
import type {
  IncomingMessageNotification,
  MessageData,
  NotificationBody,
  OutgoingMessageStatusNotification,
  OutgoingStatus,
} from '@/shared/api/greenApi'
import { formatPhone } from '@/shared/lib/phone'

const STATUS_MAP: Partial<Record<OutgoingStatus, MessageStatus>> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
  notInGroup: 'failed',
}

function extractText(data: MessageData): string | null {
  if (data.typeMessage === 'textMessage' && 'textMessageData' in data) {
    return data.textMessageData.textMessage
  }
  if (data.typeMessage === 'extendedTextMessage' && 'extendedTextMessageData' in data) {
    return data.extendedTextMessageData.text
  }
  return null
}

function fromIncomingMessage(body: IncomingMessageNotification) {
  const { senderData, messageData } = body
  const phone = senderData.senderPhoneNumber ? String(senderData.senderPhoneNumber) : null
  const name =
    senderData.chatName ||
    senderData.senderContactName ||
    senderData.senderName ||
    (phone ? formatPhone(phone) : senderData.chatId)
  const text = extractText(messageData)

  return incomingMessageReceived({
    chat: { id: senderData.chatId, name, phone },
    message: {
      id: body.idMessage,
      text: text ?? '',
      timestamp: body.timestamp * 1000,
      ...(text === null && { unsupported: true }),
    },
  })
}

function fromOutgoingStatus(body: OutgoingMessageStatusNotification) {
  const status = STATUS_MAP[body.status]
  return status ? messageStatusUpdated({ id: body.idMessage, status }) : null
}

export function notificationToAction(body: NotificationBody): UnknownAction | null {
  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
      return fromIncomingMessage(body as IncomingMessageNotification)
    case 'outgoingMessageStatus':
      return fromOutgoingStatus(body as OutgoingMessageStatusNotification)
    default:
      return null
  }
}
