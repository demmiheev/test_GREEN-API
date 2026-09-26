import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Credentials } from '@/shared/api/greenApi'

export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline'

export interface SessionState {
  credentials: Credentials | null
  connection: ConnectionStatus
  connectionError: string | null
}

const initialState: SessionState = {
  credentials: null,
  connection: 'idle',
  connectionError: null,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    loggedIn(state, action: PayloadAction<Credentials>) {
      state.credentials = action.payload
      state.connection = 'connecting'
      state.connectionError = null
    },
    loggedOut() {
      return initialState
    },
    connectionChanged(
      state,
      action: PayloadAction<{ status: ConnectionStatus; error?: string | null }>,
    ) {
      state.connection = action.payload.status
      state.connectionError = action.payload.error ?? null
    },
  },
  selectors: {
    selectCredentials: (state) => state.credentials,
    selectIsAuthorized: (state) => state.credentials !== null,
    selectConnection: (state) => state.connection,
    selectConnectionError: (state) => state.connectionError,
  },
})

export const { loggedIn, loggedOut, connectionChanged } = sessionSlice.actions
export const { selectCredentials, selectIsAuthorized, selectConnection, selectConnectionError } =
  sessionSlice.selectors
