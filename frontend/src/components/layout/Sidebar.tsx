import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SongIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11.5" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.5 12.5V4l7-2v8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function KitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ContactsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 13c0-1.657-1.343-3-3-3s-3 1.343-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 9.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14c0-2.21 1.79-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
    </svg>
  )
}

const navItems: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',     icon: <DashIcon /> },
  { to: '/profile',    label: 'My Profile',    icon: <ProfileIcon /> },
  { to: '/songs',      label: 'Songs',         icon: <SongIcon /> },
  { to: '/kits/new',   label: 'Generate Kit',  icon: <KitIcon /> },
  { to: '/contacts',   label: 'Outreach',      icon: <ContactsIcon /> },
  { to: '/goals',      label: 'Goals',         icon: <GoalsIcon /> },
]

export function Sidebar() {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-56 bg-gray-950 z-20 overflow-y-auto flex flex-col">
      <nav className="p-3 space-y-0.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="shrink-0 opacity-90">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="rounded-xl bg-gradient-to-br from-brand-900/60 to-purple-900/40 p-3 text-xs text-brand-300 leading-relaxed">
          <p className="font-semibold text-brand-200 mb-0.5">Pro tip</p>
          Complete your profile &amp; songs before generating a kit for best results.
        </div>
      </div>
    </aside>
  )
}
