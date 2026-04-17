import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Artist } from '../../types'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

const schema = z.object({
  stage_name: z.string().min(1, 'Stage name is required').max(100),
  real_name: z.string().max(100).optional(),
  genre: z.string().min(1, 'Genre is required').max(200),
  location: z.string().max(100).optional(),
  bio_raw: z.string().max(2000).optional(),
  influences: z.string().optional(),
  years_active: z.coerce.number().int().min(0).max(100).optional().or(z.literal('')),
  website_url: z.string().url('Must be a valid URL').max(300).optional().or(z.literal('')),
  instagram: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional(),
  spotify: z.string().max(300).optional(),
})

type FormValues = z.infer<typeof schema>

interface ArtistProfileFormProps {
  artist: Artist | null
  onSave: (data: Partial<Artist>) => Promise<void>
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 inline-block shrink-0" />
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export function ArtistProfileForm({ artist, onSave }: ArtistProfileFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (artist) {
      reset({
        stage_name: artist.stage_name,
        real_name: artist.real_name ?? '',
        genre: artist.genre,
        location: artist.location ?? '',
        bio_raw: artist.bio_raw ?? '',
        influences: artist.influences?.join(', ') ?? '',
        years_active: artist.years_active ?? '',
        website_url: artist.website_url ?? '',
        instagram: artist.social_handles?.instagram ?? '',
        twitter: artist.social_handles?.twitter ?? '',
        tiktok: artist.social_handles?.tiktok ?? '',
        spotify: artist.social_handles?.spotify ?? '',
      })
    }
  }, [artist, reset])

  const onSubmit = async (values: FormValues) => {
    const { instagram, twitter, tiktok, spotify, influences, years_active, ...rest } = values
    await onSave({
      ...rest,
      years_active: years_active ? Number(years_active) : undefined,
      influences: influences ? influences.split(',').map((s) => s.trim()).filter(Boolean) : [],
      social_handles: { instagram, twitter, tiktok, spotify },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">

      {/* Identity */}
      <SectionCard title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Stage Name *"
            {...register('stage_name')}
            error={errors.stage_name?.message}
          />
          <Input label="Real Name" {...register('real_name')} />
          <Input
            label="Genre(s) *"
            {...register('genre')}
            error={errors.genre?.message}
            hint='e.g. "Afrobeats, R&B"'
          />
          <Input label="Location" {...register('location')} hint="City, Country" />
        </div>
      </SectionCard>

      {/* Career */}
      <SectionCard title="Career">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Years Active" type="number" {...register('years_active')} />
          <Input
            label="Website URL"
            {...register('website_url')}
            error={errors.website_url?.message}
            placeholder="https://"
          />
        </div>
      </SectionCard>

      {/* Bio & Influences */}
      <SectionCard title="Bio &amp; Influences">
        <div className="space-y-4">
          <Textarea
            label="Bio / Artist Notes"
            {...register('bio_raw')}
            hint="Raw notes about you — AI will polish this into the final bio"
            rows={5}
          />
          <Input
            label="Influences"
            {...register('influences')}
            hint="Comma-separated, e.g. Fela Kuti, Burna Boy, D'Angelo"
          />
        </div>
      </SectionCard>

      {/* Social Links */}
      <SectionCard title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Instagram" {...register('instagram')} placeholder="@handle" />
          <Input label="Twitter / X" {...register('twitter')} placeholder="@handle" />
          <Input label="TikTok" {...register('tiktok')} placeholder="@handle" />
          <Input label="Spotify Artist URL" {...register('spotify')} />
        </div>
      </SectionCard>

      <Button type="submit" loading={isSubmitting} size="lg">
        {artist ? 'Save Changes' : 'Create Profile'}
      </Button>
    </form>
  )
}
