import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { sessionSlice } from '@/entities/session'
import { greenApi } from '@/shared/api/greenApi'
import { listenerMiddleware } from './listenerMiddleware'
import { loadPersistedState, setupPersistence } from './persistence'

const rootReducer = combineSlices(greenApi, sessionSlice)

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(listenerMiddleware.middleware).concat(greenApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']

export function createAppStore() {
  const store = makeStore(loadPersistedState())
  setupPersistence(store)
  return store
}
