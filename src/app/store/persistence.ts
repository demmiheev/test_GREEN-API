import {
  chatsHydrated,
  chatsSlice,
  selectPersistedChats,
  type PersistedChats,
} from '@/entities/chat'
import type { Credentials } from '@/shared/api/greenApi'
import { storage } from '@/shared/lib/storage'
import type { AppStore, RootState } from './store'

const SESSION_KEY = 'session'
const chatsKey = (idInstance: string) => `chats:${idInstance}`

const SAVE_DELAY_MS = 300

export function loadPersistedState(): Partial<RootState> | undefined {
  const credentials = storage.get<Credentials>(SESSION_KEY)
  if (!credentials) return undefined

  const chats = storage.get<PersistedChats>(chatsKey(credentials.idInstance))

  return {
    session: { credentials, connection: 'connecting', connectionError: null },
    chats: chatsSlice.reducer(undefined, chatsHydrated(chats)),
  }
}

export function setupPersistence(store: AppStore) {
  let prev = store.getState()
  let saveTimer: ReturnType<typeof setTimeout> | undefined

  const saveChats = (idInstance: string) => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      storage.set(chatsKey(idInstance), selectPersistedChats(store.getState()))
    }, SAVE_DELAY_MS)
  }

  return store.subscribe(() => {
    const state = store.getState()
    const prevState = prev
    // Обновляется до dispatch ниже: вложенный dispatch повторно вызывает этот listener
    prev = state
    const prevCredentials = prevState.session.credentials
    const { credentials } = state.session

    if (credentials !== prevCredentials) {
      if (credentials) {
        storage.set(SESSION_KEY, credentials)
        store.dispatch(chatsHydrated(storage.get<PersistedChats>(chatsKey(credentials.idInstance))))
      } else {
        clearTimeout(saveTimer)
        storage.remove(SESSION_KEY)
        if (prevCredentials) storage.remove(chatsKey(prevCredentials.idInstance))
      }
    } else if (
      credentials &&
      (state.chats.chats !== prevState.chats.chats ||
        state.chats.messages !== prevState.chats.messages)
    ) {
      saveChats(credentials.idInstance)
    }
  })
}
