import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      navigate('/dashboard')
    } else {
      setAwaitingConfirmation(true)
      setLoading(false)
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-brand-50/30 to-purple-50/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-scale-in text-center">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 p-10">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6">
              We sent a confirmation link to <strong className="text-gray-700">{email}</strong>.
              Click it to activate your account, then come back and sign in.
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">Back to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-1/3 -left-16 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-4 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M4 22V11l5-2.5v13M11 22V7l5-2.5v17.5M18 22V14l3-1.5v9.5"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-semibold">Artist Management</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Built for<br />
            <span className="gradient-text">independent artists</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Generate professional press kits, marketing timelines, and platform pitches in minutes — not days.
          </p>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          Free to start · No credit card required
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-xl shadow-brand-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                <path d="M4 22V11l5-2.5v13M11 22V7l5-2.5v17.5M18 22V14l3-1.5v9.5"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-gray-500">Start building your artist presence</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                autoComplete="new-password"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
