import { selectIsAuthorized } from '@/entities/session'
import { LoginPage } from '@/pages/login'
import { StoreProvider } from './providers/StoreProvider'
import { useAppSelector } from './store'

function Router() {
  const isAuthorized = useAppSelector(selectIsAuthorized)
  return isAuthorized ? <main>Чаты</main> : <LoginPage />
}

export function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
