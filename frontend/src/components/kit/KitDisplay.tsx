import { EPKit, KitContent, ChecklistProgressRecord } from '../../types'
import { KitSection, MarkdownSection } from './KitSection'
import { PreReleasePlan } from './PreReleasePlan'
import { PostReleasePlan } from './PostReleasePlan'
import { PlatformPitches } from './PlatformPitches'
import { SyncRadioPitches } from './SyncRadioPitches'
import { VisualIdentityBrief } from './VisualIdentityBrief'
import { ARFeedbackSection } from './ARFeedbackSection'

interface KitDisplayProps {
  kit: EPKit
  content?: KitContent
  onContentUpdate?: (partial: Partial<KitContent>) => void
  progress?: ChecklistProgressRecord[]
  onToggle?: (section: 'pre_release' | 'post_release', phaseIndex: number, taskIndex: number, completed: boolean) => void
}

export function KitDisplay({ kit, content: contentOverride, onContentUpdate, progress = [], onToggle }: KitDisplayProps) {
  const content = (contentOverride ?? kit.content) as KitContent
  const meta = content._meta

  const kitId = kit.id

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="relative z-10">
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-widest mb-2">
            {kit.ep_release_type?.toUpperCase() ?? 'EP'} Press Kit
          </p>
          <h1 className="text-3xl font-bold">{kit.ep_title}</h1>
          {kit.ep_release_date && (
            <p className="text-gray-400 text-sm mt-2">Release · {kit.ep_release_date}</p>
          )}
        </div>
      </div>

      {/* Generation meta badge */}
      {meta && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {meta.provider} / {meta.model}
          </span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {meta.agents_used.length} agents
          </span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {new Date(meta.generated_at).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Agent 1 — Narrative */}
      <MarkdownSection
        title="Artist Bio"
        content={content.artist_bio}
        kitId={kitId}
        sectionKey="artist_bio"
        onRegenerated={onContentUpdate}
      />
      <MarkdownSection
        title="EP Overview"
        content={content.ep_overview}
        kitId={kitId}
        sectionKey="ep_overview"
        onRegenerated={onContentUpdate}
      />

      {/* Agent 2 — Press */}
      <MarkdownSection
        title="Press Release"
        content={content.press_release}
        kitId={kitId}
        sectionKey="press_release"
        onRegenerated={onContentUpdate}
      />

      {content.interview_talking_points?.length > 0 && (
        <KitSection
          title="Interview Talking Points"
          kitId={kitId}
          sectionKey="interview_talking_points"
          onRegenerated={onContentUpdate}
        >
          <ol className="list-decimal list-inside space-y-2">
            {content.interview_talking_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ol>
        </KitSection>
      )}

      {/* Agent 3 — Content */}
      {content.track_descriptions && Object.keys(content.track_descriptions).length > 0 && (
        <KitSection
          title="Track Descriptions"
          kitId={kitId}
          sectionKey="track_descriptions"
          onRegenerated={onContentUpdate}
        >
          <div className="space-y-4">
            {Object.entries(content.track_descriptions).map(([title, desc]) => (
              <div key={title} className="border-l-2 border-brand-200 pl-4">
                <p className="font-medium text-gray-900">{title}</p>
                <p className="mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </KitSection>
      )}

      {content.social_captions && (
        <KitSection
          title="Social Media Captions"
          kitId={kitId}
          sectionKey="social_captions"
          onRegenerated={onContentUpdate}
        >
          <div className="space-y-4">
            {content.social_captions.instagram && (
              <div>
                <p className="font-medium text-gray-800 mb-1">Instagram</p>
                <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3">{content.social_captions.instagram}</p>
              </div>
            )}
            {content.social_captions.twitter && (
              <div>
                <p className="font-medium text-gray-800 mb-1">Twitter / X</p>
                <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3">{content.social_captions.twitter}</p>
              </div>
            )}
            {content.social_captions.tiktok && (
              <div>
                <p className="font-medium text-gray-800 mb-1">TikTok</p>
                <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3">{content.social_captions.tiktok}</p>
              </div>
            )}
            {content.social_captions.facebook && (
              <div>
                <p className="font-medium text-gray-800 mb-1">Facebook</p>
                <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3">{content.social_captions.facebook}</p>
              </div>
            )}
          </div>
        </KitSection>
      )}

      {content.streaming_pitch && (
        <MarkdownSection
          title="Streaming Pitch (for Playlist Curators)"
          content={content.streaming_pitch}
          kitId={kitId}
          sectionKey="streaming_pitch"
          onRegenerated={onContentUpdate}
        />
      )}

      {/* Agent 4 — Pre-release */}
      {content.pre_release_plan && (
        <KitSection
          title="Pre-Release Plan"
          kitId={kitId}
          sectionKey="pre_release_plan"
          onRegenerated={onContentUpdate}
        >
          <PreReleasePlan
            plan={content.pre_release_plan}
            releaseDate={kit.ep_release_date}
            progress={progress}
            onToggle={onToggle ? (section, phaseIndex, taskIndex, completed) =>
              onToggle(section, phaseIndex, taskIndex, completed) : undefined}
          />
        </KitSection>
      )}

      {/* Agent 5 — Post-release */}
      {content.post_release_plan && (
        <KitSection
          title="Post-Release Plan"
          kitId={kitId}
          sectionKey="post_release_plan"
          onRegenerated={onContentUpdate}
        >
          <PostReleasePlan
            plan={content.post_release_plan}
            progress={progress}
            onToggle={onToggle ? (section, phaseIndex, taskIndex, completed) =>
              onToggle(section, phaseIndex, taskIndex, completed) : undefined}
          />
        </KitSection>
      )}

      {/* Agent 6 — Platform pitches */}
      {content.platform_pitches && Object.keys(content.platform_pitches).length > 0 && (
        <KitSection
          title="Platform Pitches"
          kitId={kitId}
          sectionKey="platform_pitches"
          onRegenerated={onContentUpdate}
        >
          <PlatformPitches pitches={content.platform_pitches} />
        </KitSection>
      )}

      {/* Agent 7 — Sync & Radio Pitches */}
      {content.sync_radio_pitches && (
        <KitSection
          title="Sync & Radio Pitches"
          kitId={kitId}
          sectionKey="sync_radio_pitches"
          onRegenerated={onContentUpdate}
        >
          <SyncRadioPitches pitches={content.sync_radio_pitches} />
        </KitSection>
      )}

      {/* Agent 8 — Visual Identity Brief */}
      {content.visual_identity_brief && (
        <KitSection
          title="Visual Identity Brief"
          kitId={kitId}
          sectionKey="visual_identity_brief"
          onRegenerated={onContentUpdate}
        >
          <VisualIdentityBrief brief={content.visual_identity_brief} />
        </KitSection>
      )}

      {/* On-demand — A&R Feedback */}
      <KitSection title="A&R Feedback">
        <ARFeedbackSection kitId={kitId} feedback={kit.ar_feedback} />
      </KitSection>
    </div>
  )
}
