import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
      <rect width="28" height="28" rx="8" className="fill-brand-600" />
      <path
        d="M7 20V12l4-2v8M13 20V9l4-2v13M19 20v-6l2-1v7"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <LogoIcon />
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-gray-900">Artist</span>
            <span className="text-base font-bold gradient-text">Management</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[200px]">
              {user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
