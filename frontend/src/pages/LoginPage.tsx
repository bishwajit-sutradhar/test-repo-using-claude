import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

function BrandLogo() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-xl shadow-brand-500/30 flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <path
            d="M4 22V11l5-2.5v13M11 22V7l5-2.5v17.5M18 22V14l3-1.5v9.5"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Artist <span className="gradient-text">Management</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

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

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Your complete<br />
            <span className="gradient-text">artist toolkit</span>
          </h2>
          <div className="space-y-3">
            {[
              'AI-generated press kits & bios',
              'Pre & post-release marketing plans',
              'Per-platform streaming pitches',
              'Multi-model AI support',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          Powered by OpenAI, Gemini &amp; Anthropic
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm animate-scale-in">
          <BrandLogo />

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
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
