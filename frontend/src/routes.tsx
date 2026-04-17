import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { ArtistProfilePage } from './pages/ArtistProfilePage'
import { SongDetailsPage } from './pages/SongDetailsPage'
import { GenerateKitPage } from './pages/GenerateKitPage'
import { KitViewPage } from './pages/KitViewPage'
import { ContactsPage } from './pages/ContactsPage'
import { GoalsPage } from './pages/GoalsPage'

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="ml-56 pt-14 min-h-screen">
        <div className="p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppShell><DashboardPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppShell><ArtistProfilePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/songs" element={
        <ProtectedRoute>
          <AppShell><SongDetailsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/kits/new" element={
        <ProtectedRoute>
          <AppShell><GenerateKitPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/kits/:id" element={
        <ProtectedRoute>
          <AppShell><KitViewPage /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/contacts" element={
        <ProtectedRoute>
          <AppShell><ContactsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <AppShell><GoalsPage /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
