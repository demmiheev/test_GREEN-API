export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type InstanceState =
  'notAuthorized' | 'authorized' | 'blocked' | 'sleepMode' | 'starting' | 'yellowCard'

export interface GetStateInstanceResponse {
  stateInstance: InstanceState
}

export interface CheckAccountResponse {
  exist: boolean
  chatId: string
  username?: string
  phoneNumber?: number
}

export interface SendMessageRequest {
  chatId: string
  message: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export type MessageData =
  | { typeMessage: 'textMessage'; textMessageData: { textMessage: string } }
  | { typeMessage: 'extendedTextMessage'; extendedTextMessageData: { text: string } }
  | { typeMessage: string }

export interface IncomingMessageNotification {
  typeWebhook: 'incomingMessageReceived'
  idMessage: string
  timestamp: number
  senderData: SenderData
  messageData: MessageData
}

export type OutgoingStatus =
  'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup'

export interface OutgoingMessageStatusNotification {
  typeWebhook: 'outgoingMessageStatus'
  idMessage: string
  chatId: string
  status: OutgoingStatus
  timestamp: number
  description?: string
}

export interface UnknownNotification {
  typeWebhook: string
}

export type NotificationBody =
  IncomingMessageNotification | OutgoingMessageStatusNotification | UnknownNotification

export interface Notification {
  receiptId: number
  body: NotificationBody
}
