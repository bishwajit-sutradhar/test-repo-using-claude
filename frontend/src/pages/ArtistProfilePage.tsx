import { useState } from 'react'
import { useArtistProfile } from '../hooks/useArtistProfile'
import { ArtistProfileForm } from '../components/forms/ArtistProfileForm'
import { useToastStore } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Artist } from '../types'

// ── Social link helpers ────────────────────────────────────────────────────

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'instagram':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
        </svg>
      )
    case 'spotify':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      )
    default:
      return <span className="text-xs font-bold uppercase">{platform[0]}</span>
  }
}

// ── Profile view (read-only) ───────────────────────────────────────────────

function ProfileView({ artist, onEdit }: { artist: Artist; onEdit: () => void }) {
  const socials = Object.entries(artist.social_handles ?? {}).filter(([, v]) => v) as [string, string][]

  return (
    <div className="max-w-2xl animate-fade-in-up space-y-4">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-8">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-brand-600/25 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-xl shadow-brand-900/40">
              <span className="text-2xl font-bold text-white">
                {artist.stage_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{artist.stage_name}</h2>
              {artist.real_name && (
                <p className="text-gray-400 text-sm mt-0.5">{artist.real_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-600/30 text-brand-300 px-2.5 py-1 rounded-full border border-brand-600/30">
                  {artist.genre}
                </span>
                {artist.location && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {artist.location}
                  </span>
                )}
                {artist.years_active != null && (
                  <span className="text-xs text-gray-400">{artist.years_active} yr{artist.years_active !== 1 ? 's' : ''} active</span>
                )}
              </div>
            </div>
          </div>

          <Button size="sm" variant="secondary" onClick={onEdit} className="shrink-0">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Bio */}
      {artist.bio_raw && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 inline-block" />
            Bio &amp; Notes
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{artist.bio_raw}</p>
        </div>
      )}

      {/* Influences */}
      {artist.influences && artist.influences.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 inline-block" />
            Influences
          </h3>
          <div className="flex flex-wrap gap-2">
            {artist.influences.map((inf) => (
              <span key={inf} className="text-sm bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1 rounded-full">
                {inf}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links & Social */}
      {(artist.website_url || socials.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 inline-block" />
            Links &amp; Social
          </h3>
          <div className="space-y-2.5">
            {artist.website_url && (
              <a
                href={artist.website_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-brand-600 hover:text-brand-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-brand-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                  </svg>
                </div>
                <span className="truncate">{artist.website_url}</span>
              </a>
            )}
            {socials.map(([platform, handle]) => (
              <div key={platform} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                  <SocialIcon platform={platform} />
                </div>
                <span className="capitalize text-gray-500 w-16 text-xs font-medium">{platform}</span>
                <span className="text-gray-700">{handle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state hint — no bio/influences yet */}
      {!artist.bio_raw && (!artist.influences || artist.influences.length === 0) && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-400 mb-3">Add a bio and influences to get richer AI-generated content</p>
          <Button size="sm" variant="secondary" onClick={onEdit}>Complete your profile</Button>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export function ArtistProfilePage() {
  const { artist, loading, save } = useArtistProfile()
  const addToast = useToastStore((s) => s.addToast)
  const [editing, setEditing] = useState(false)

  const handleSave = async (data: Partial<Artist>) => {
    await save(data).catch((err: { response?: { data?: { error?: string } } }) => {
      const msg = err?.response?.data?.error ?? 'Failed to save profile'
      addToast(msg, 'error')
      throw err
    })
    addToast('Profile saved', 'success')
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  // No profile yet — show create form directly
  if (!artist) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Artist Profile</h1>
          <p className="mt-1 text-gray-500">
            Your profile powers all the AI-generated content in your press kits
          </p>
        </div>
        <ArtistProfileForm artist={null} onSave={handleSave} />
      </div>
    )
  }

  // Profile exists + editing
  if (editing) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-1 text-gray-500">Update your artist details</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            ← Cancel
          </Button>
        </div>
        <ArtistProfileForm artist={artist} onSave={handleSave} />
      </div>
    )
  }

  // Profile exists — show view
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Artist Profile</h1>
        <p className="mt-1 text-gray-500">
          Your details used to generate press kits
        </p>
      </div>
      <ProfileView artist={artist} onEdit={() => setEditing(true)} />
    </div>
  )
}
