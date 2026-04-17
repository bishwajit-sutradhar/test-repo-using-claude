import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEPKit } from '../hooks/useEPKit'
import { useChecklist } from '../hooks/useChecklist'
import { EPKit, KitContent } from '../types'
import { KitDisplay } from '../components/kit/KitDisplay'
import { KitExportButton } from '../components/kit/KitExportButton'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

export function KitViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchKit } = useEPKit()
  const [kit, setKit] = useState<EPKit | null>(null)
  const [content, setContent] = useState<KitContent | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { progress, fetchProgress, toggleItem } = useChecklist(id ?? '')

  useEffect(() => {
    if (!id) return
    fetchKit(id)
      .then((loaded) => {
        setKit(loaded)
        setContent(loaded.content)
      })
      .catch(() => setError('Failed to load kit'))
      .finally(() => setLoading(false))
  }, [id, fetchKit])

  useEffect(() => {
    if (!id || !kit?.content) return
    fetchProgress()
  }, [id, kit?.content, fetchProgress])

  const handleContentUpdate = (partial: Partial<KitContent>) => {
    setContent((prev) => prev ? { ...prev, ...partial } : prev)
  }

  const handleToggle = (
    section: 'pre_release' | 'post_release',
    phaseIndex: number,
    taskIndex: number,
    completed: boolean
  ) => {
    toggleItem(section, phaseIndex, taskIndex, completed)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || 'Kit not found'}</p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>
    )
  }

  if (kit.generation_status === 'failed') {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-2 font-medium">Kit generation failed</p>
        <p className="text-gray-500 mb-6">The AI could not generate this kit. Please try again.</p>
        <Button onClick={() => navigate('/kits/new')}>Try Again</Button>
      </div>
    )
  }

  if (!kit.content) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Spinner size="lg" />
        <p className="text-gray-600">Kit is still generating…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </Button>
        <KitExportButton kit={{ ...kit, content: content ?? kit.content }} />
      </div>
      <KitDisplay
        kit={kit}
        content={content}
        onContentUpdate={handleContentUpdate}
        progress={progress}
        onToggle={handleToggle}
      />
    </div>
  )
}
