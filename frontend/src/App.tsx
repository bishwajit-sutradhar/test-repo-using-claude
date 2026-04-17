import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ToastContainer } from './components/ui/Toast'
import { useAuth } from './hooks/useAuth'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuth() // sets up Supabase auth listener on mount
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
        <ToastContainer />
      </AuthInitializer>
    </BrowserRouter>
  )
}
