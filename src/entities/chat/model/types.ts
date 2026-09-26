export interface Chat {
  id: string
  name: string
  phone: string | null
  lastActivityAt: number
  unreadCount: number
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  chatId: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
  status: MessageStatus
  unsupported?: boolean
}
