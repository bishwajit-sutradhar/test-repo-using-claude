import ReactMarkdown from 'react-markdown'
import { RegenerateButton } from './RegenerateButton'
import { RegenerableSection } from '../../hooks/useAgentRegenerate'
import { KitContent } from '../../types'

interface KitSectionProps {
  title: string
  children: React.ReactNode
  kitId?: string
  sectionKey?: RegenerableSection
  onRegenerated?: (partial: Partial<KitContent>) => void
}

export function KitSection({ title, children, kitId, sectionKey, onRegenerated }: KitSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 transition-shadow duration-200 hover:shadow-md hover:shadow-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 inline-block" />
          {title}
        </h2>
        {kitId && sectionKey && onRegenerated && (
          <RegenerateButton kitId={kitId} sectionKey={sectionKey} onRegenerated={onRegenerated} />
        )}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  )
}

export function MarkdownSection({
  title, content, kitId, sectionKey, onRegenerated,
}: {
  title: string
  content: string
  kitId?: string
  sectionKey?: RegenerableSection
  onRegenerated?: (partial: Partial<KitContent>) => void
}) {
  return (
    <KitSection title={title} kitId={kitId} sectionKey={sectionKey} onRegenerated={onRegenerated}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </KitSection>
  )
}
