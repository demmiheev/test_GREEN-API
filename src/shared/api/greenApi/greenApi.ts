import { createApi } from '@reduxjs/toolkit/query/react'
import { greenApiBaseQuery } from './baseQuery'
import type {
  CheckAccountResponse,
  Credentials,
  GetStateInstanceResponse,
  Notification,
  SendMessageRequest,
  SendMessageResponse,
} from './types'

export const RECEIVE_TIMEOUT_SEC = 20

export const greenApi = createApi({
  reducerPath: 'greenApi',
  baseQuery: greenApiBaseQuery,
  endpoints: (build) => ({
    getStateInstance: build.mutation<GetStateInstanceResponse, Credentials>({
      query: (credentials) => ({ method: 'getStateInstance', credentials }),
    }),
    checkAccount: build.mutation<CheckAccountResponse, string>({
      query: (phoneNumber) => ({
        method: 'checkAccount',
        httpMethod: 'POST',
        body: { phoneNumber: Number(phoneNumber) },
      }),
    }),
    sendMessage: build.mutation<SendMessageResponse, SendMessageRequest>({
      query: (body) => ({ method: 'sendMessage', httpMethod: 'POST', body }),
    }),
    receiveNotification: build.mutation<Notification | null, void>({
      query: () => ({
        method: 'receiveNotification',
        params: { receiveTimeout: RECEIVE_TIMEOUT_SEC },
        // запас сверху, чтобы клиент не оборвал long polling раньше сервера
        timeout: (RECEIVE_TIMEOUT_SEC + 10) * 1000,
      }),
    }),
    deleteNotification: build.mutation<{ result: boolean }, number>({
      query: (receiptId) => ({
        method: 'deleteNotification',
        httpMethod: 'DELETE',
        pathSuffix: String(receiptId),
      }),
    }),
  }),
})

export const { useGetStateInstanceMutation, useCheckAccountMutation } = greenApi
