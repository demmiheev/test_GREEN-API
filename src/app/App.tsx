import { selectIsAuthorized } from '@/entities/session'
import { ChatPage } from '@/pages/chat'
import { LoginPage } from '@/pages/login'
import { StoreProvider } from './providers/StoreProvider'
import { useAppSelector } from './store'

function Router() {
  const isAuthorized = useAppSelector(selectIsAuthorized)
  return isAuthorized ? <ChatPage /> : <LoginPage />
}

export function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
