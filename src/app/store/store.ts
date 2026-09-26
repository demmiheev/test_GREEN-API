import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { chatsSlice } from '@/entities/chat'
import { sessionSlice } from '@/entities/session'
import { greenApi } from '@/shared/api/greenApi'
import { loadPersistedState, setupPersistence } from './persistence'

const rootReducer = combineSlices(greenApi, sessionSlice, chatsSlice)

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(greenApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']

export function createAppStore() {
  const store = makeStore(loadPersistedState())
  setupPersistence(store)
  return store
}
