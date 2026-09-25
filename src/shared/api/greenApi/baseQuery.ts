import { fetchBaseQuery, type BaseQueryFn, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { normalizeApiUrl } from '@/shared/lib/apiUrl'
import type { Credentials } from './types'

export interface GreenApiRequest {
  method: string
  httpMethod?: 'GET' | 'POST' | 'DELETE'
  pathSuffix?: string
  params?: Record<string, string | number>
  body?: unknown
  timeout?: number
  credentials?: Credentials
}

interface StateWithSession {
  session: { credentials: Credentials | null }
}

export const NO_CREDENTIALS_ERROR: FetchBaseQueryError = {
  status: 'CUSTOM_ERROR',
  error: 'Не заданы учётные данные GREEN-API',
}

export function buildMethodUrl(credentials: Credentials, method: string, pathSuffix?: string) {
  const { apiUrl, idInstance, apiTokenInstance } = credentials
  const base = `${normalizeApiUrl(apiUrl)}/waInstance${idInstance}/${method}/${apiTokenInstance}`
  return pathSuffix ? `${base}/${pathSuffix}` : base
}

const rawBaseQuery = fetchBaseQuery({
  // receiveNotification при пустой очереди отвечает пустым телом, а не JSON
  responseHandler: async (response) => {
    const text = await response.text()
    return text ? JSON.parse(text) : null
  },
})

// Учётные данные передаются в пути URL, поэтому статичный baseUrl не подходит
export const greenApiBaseQuery: BaseQueryFn<GreenApiRequest, unknown, FetchBaseQueryError> = (
  { method, httpMethod = 'GET', pathSuffix, params, body, timeout, credentials },
  api,
  extraOptions,
) => {
  const resolved = credentials ?? (api.getState() as StateWithSession).session.credentials
  if (!resolved) return { error: NO_CREDENTIALS_ERROR }

  return rawBaseQuery(
    {
      url: buildMethodUrl(resolved, method, pathSuffix),
      method: httpMethod,
      params,
      body,
      timeout,
    },
    api,
    extraOptions,
  )
}
