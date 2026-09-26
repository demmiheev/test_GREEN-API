import type { Credentials } from '@/shared/api/greenApi'
import { storage } from '@/shared/lib/storage'
import type { AppStore, RootState } from './store'

const SESSION_KEY = 'session'

export function loadPersistedState(): Partial<RootState> | undefined {
  const credentials = storage.get<Credentials>(SESSION_KEY)
  if (!credentials) return undefined

  return {
    session: { credentials, connection: 'connecting', connectionError: null },
  }
}

export function setupPersistence(store: AppStore) {
  let prevCredentials = store.getState().session.credentials

  return store.subscribe(() => {
    const { credentials } = store.getState().session
    if (credentials === prevCredentials) return
    prevCredentials = credentials

    if (credentials) storage.set(SESSION_KEY, credentials)
    else storage.remove(SESSION_KEY)
  })
}
