import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function isAuthError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && (error.status === 401 || error.status === 403)
}

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | unknown): string {
  if (!isFetchBaseQueryError(error)) {
    const message = (error as SerializedError | undefined)?.message
    return message ?? 'Неизвестная ошибка'
  }

  switch (error.status) {
    case 400:
      return 'Некорректный запрос'
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance'
    case 404:
      return 'Метод не найден — проверьте apiUrl'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 466:
      return 'Исчерпан лимит тарифа GREEN-API'
    case 'FETCH_ERROR':
      return 'Нет соединения с сервером GREEN-API'
    case 'TIMEOUT_ERROR':
      return 'Сервер не ответил вовремя'
    case 'PARSING_ERROR':
      return 'Некорректный ответ сервера'
    case 'CUSTOM_ERROR':
      return error.error
    default:
      return typeof error.status === 'number' && error.status >= 500
        ? 'Ошибка на стороне GREEN-API, попробуйте позже'
        : `Ошибка запроса (${String(error.status)})`
  }
}
