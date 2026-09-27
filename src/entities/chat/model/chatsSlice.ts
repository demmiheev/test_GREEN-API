import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { loggedOut } from '@/entities/session'
import { formatPhone } from '@/shared/lib/phone'
import type { Chat, Message, MessageStatus } from './types'

export const chatsAdapter = createEntityAdapter<Chat>({
  sortComparer: (a, b) => b.lastActivityAt - a.lastActivityAt,
})

const toSeconds = (ms: number) => Math.floor(ms / 1000)

export const messagesAdapter = createEntityAdapter<Message>({
  // У GREEN-API timestamp в секундах, у локальных сообщений в мс: сравнение по секундам
  // сохраняет порядок поступления внутри одной секунды
  sortComparer: (a, b) => toSeconds(a.timestamp) - toSeconds(b.timestamp),
})

export interface ChatsState {
  chats: EntityState<Chat, string>
  messages: EntityState<Message, string>
  activeChatId: string | null
}

export type PersistedChats = Pick<ChatsState, 'chats' | 'messages'>

const initialState: ChatsState = {
  chats: chatsAdapter.getInitialState(),
  messages: messagesAdapter.getInitialState(),
  activeChatId: null,
}

// Статус только растёт: запоздавший sent не должен перетереть read
const STATUS_RANK: Record<MessageStatus, number> = {
  failed: 0,
  pending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
}

interface ChatInfo {
  id: string
  name: string
  phone: string | null
}

function touchChat(state: ChatsState, chatId: string, timestamp: number) {
  const chat = state.chats.entities[chatId]
  if (chat && timestamp > chat.lastActivityAt) {
    chatsAdapter.updateOne(state.chats, { id: chatId, changes: { lastActivityAt: timestamp } })
  }
}

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    chatOpened(state, action: PayloadAction<ChatInfo>) {
      const { id, name, phone } = action.payload
      const existing = state.chats.entities[id]
      if (existing) {
        existing.unreadCount = 0
      } else {
        chatsAdapter.addOne(state.chats, {
          id,
          name,
          phone,
          lastActivityAt: Date.now(),
          unreadCount: 0,
        })
      }
      state.activeChatId = id
    },

    chatSelected(state, action: PayloadAction<string | null>) {
      state.activeChatId = action.payload
      const chat = action.payload ? state.chats.entities[action.payload] : undefined
      if (chat) chat.unreadCount = 0
    },

    incomingMessageReceived(
      state,
      action: PayloadAction<{
        chat: ChatInfo
        message: Omit<Message, 'chatId' | 'direction' | 'status'>
      }>,
    ) {
      const { chat, message } = action.payload
      if (state.messages.entities[message.id]) return

      const existing = state.chats.entities[chat.id]
      if (!existing) {
        chatsAdapter.addOne(state.chats, {
          ...chat,
          lastActivityAt: message.timestamp,
          unreadCount: 0,
        })
      } else {
        if (!existing.phone && chat.phone) existing.phone = chat.phone
        // У чата, созданного по номеру, имя-заглушка заменяется именем из первого ответа
        if (existing.phone && existing.name === formatPhone(existing.phone) && chat.name) {
          existing.name = chat.name
        }
      }

      messagesAdapter.addOne(state.messages, {
        ...message,
        chatId: chat.id,
        direction: 'incoming',
        status: 'read',
      })
      touchChat(state, chat.id, message.timestamp)

      if (state.activeChatId !== chat.id) {
        state.chats.entities[chat.id]!.unreadCount += 1
      }
    },

    messageSendStarted(
      state,
      action: PayloadAction<{ localId: string; chatId: string; text: string; timestamp: number }>,
    ) {
      const { localId, chatId, text, timestamp } = action.payload
      messagesAdapter.upsertOne(state.messages, {
        id: localId,
        chatId,
        text,
        timestamp,
        direction: 'outgoing',
        status: 'pending',
      })
      touchChat(state, chatId, timestamp)
    },

    messageSendSucceeded(state, action: PayloadAction<{ localId: string; idMessage: string }>) {
      const { localId, idMessage } = action.payload
      const message = state.messages.entities[localId]
      if (!message) return

      messagesAdapter.removeOne(state.messages, localId)
      messagesAdapter.addOne(state.messages, { ...message, id: idMessage, status: 'sent' })
    },

    messageSendFailed(state, action: PayloadAction<{ localId: string }>) {
      const message = state.messages.entities[action.payload.localId]
      if (message) message.status = 'failed'
    },

    messageStatusUpdated(state, action: PayloadAction<{ id: string; status: MessageStatus }>) {
      const { id, status } = action.payload
      const message = state.messages.entities[id]
      if (!message || message.direction !== 'outgoing') return

      if (status === 'failed' || STATUS_RANK[status] > STATUS_RANK[message.status]) {
        message.status = status
      }
    },

    chatsHydrated(_state, action: PayloadAction<PersistedChats | null>) {
      if (!action.payload) return initialState

      const { chats, messages } = action.payload
      // Перезагрузка обрывает запросы, результат отправки неизвестен
      const restoredMessages = messagesAdapter
        .getSelectors()
        .selectAll(messages)
        .map((message) =>
          message.status === 'pending' ? { ...message, status: 'failed' as const } : message,
        )

      return {
        chats: chatsAdapter.setAll(
          chatsAdapter.getInitialState(),
          chatsAdapter.getSelectors().selectAll(chats),
        ),
        messages: messagesAdapter.setAll(messagesAdapter.getInitialState(), restoredMessages),
        activeChatId: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loggedOut, () => initialState)
  },
  selectors: {
    selectActiveChatId: (state) => state.activeChatId,
  },
})

export const {
  chatOpened,
  chatSelected,
  incomingMessageReceived,
  messageSendStarted,
  messageSendSucceeded,
  messageSendFailed,
  messageStatusUpdated,
  chatsHydrated,
} = chatsSlice.actions

export const { selectActiveChatId } = chatsSlice.selectors

type StateWithChats = { [chatsSlice.reducerPath]: ChatsState }

const chatSelectors = chatsAdapter.getSelectors((state: StateWithChats) => state.chats.chats)
const messageSelectors = messagesAdapter.getSelectors(
  (state: StateWithChats) => state.chats.messages,
)

export const selectAllChats = chatSelectors.selectAll
export const selectChatById = chatSelectors.selectById
export const selectAllMessages = messageSelectors.selectAll

export const selectActiveChat = (state: StateWithChats) => {
  const id = state.chats.activeChatId
  return id ? selectChatById(state, id) : undefined
}

export const selectMessagesByChat = createSelector([selectAllMessages], (messages) => {
  const byChat = new Map<string, Message[]>()
  for (const message of messages) {
    const list = byChat.get(message.chatId)
    if (list) list.push(message)
    else byChat.set(message.chatId, [message])
  }
  return byChat
})

const EMPTY: Message[] = []

export const selectChatMessages = (state: StateWithChats, chatId: string) =>
  selectMessagesByChat(state).get(chatId) ?? EMPTY

export const selectLastMessage = (state: StateWithChats, chatId: string) =>
  selectChatMessages(state, chatId).at(-1)

export const selectPersistedChats = (state: StateWithChats): PersistedChats => ({
  chats: state.chats.chats,
  messages: state.chats.messages,
})
