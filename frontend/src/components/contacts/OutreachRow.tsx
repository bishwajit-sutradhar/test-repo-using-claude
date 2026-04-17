import { useState } from 'react'
import { OutreachRecord, OutreachStatus, PressContact } from '../../types'
import { OutreachStatusBadge } from './OutreachStatusBadge'
import { PitchEmailModal } from './PitchEmailModal'
import { ModelSelector } from '../forms/ModelSelector'
import { useToastStore } from '../ui/Toast'

const STATUSES: OutreachStatus[] = ['not_pitched', 'pitched', 'responded', 'featured', 'rejected']
const STATUS_LABELS: Record<OutreachStatus, string> = {
  not_pitched: 'Not Pitched',
  pitched: 'Pitched',
  responded: 'Responded',
  featured: 'Featured',
  rejected: 'Rejected',
}

interface OutreachRowProps {
  contact: PressContact
  record?: OutreachRecord
  kitId: string
  onAddToKit: (contactId: string) => Promise<OutreachRecord>
  onUpdateStatus: (recordId: string, status: OutreachStatus) => Promise<OutreachRecord>
  onGeneratePitch: (contactId: string, provider: string, model: string) => Promise<{ subject: string; body: string }>
}

export function OutreachRow({ contact, record, onAddToKit, onUpdateStatus, onGeneratePitch }: OutreachRowProps) {
  const [adding, setAdding] = useState(false)
  const [localRecord, setLocalRecord] = useState<OutreachRecord | undefined>(record)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [generatingPitch, setGeneratingPitch] = useState(false)
  const [pitchResult, setPitchResult] = useState<{ subject: string; body: string } | null>(null)
  const [model, setModel] = useState({ provider: 'openai', model: 'gpt-4o' })
  const addToast = useToastStore((s) => s.addToast)

  const handleAddToKit = async () => {
    setAdding(true)
    const rec = await onAddToKit(contact.id).catch((e: Error) => {
      addToast(e.message || 'Failed to add contact', 'error')
      return null
    })
    setAdding(false)
    if (rec) setLocalRecord(rec)
  }

  const handleStatusChange = async (status: OutreachStatus) => {
    if (!localRecord) return
    const updated = await onUpdateStatus(localRecord.id, status).catch(() => null)
    if (updated) setLocalRecord(updated)
  }

  const handleGeneratePitch = async () => {
    setShowModelPicker(false)
    setGeneratingPitch(true)
    const result = await onGeneratePitch(contact.id, model.provider, model.model).catch((e: Error) => {
      addToast(e.message || 'Failed to generate pitch', 'error')
      return null
    })
    setGeneratingPitch(false)
    if (result) setPitchResult(result)
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            {contact.publication && (
              <p className="text-xs text-gray-500">{contact.publication}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!localRecord ? (
              <button
                type="button"
                onClick={handleAddToKit}
                disabled={adding}
                className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Adding…' : '+ Track Outreach'}
              </button>
            ) : (
              <>
                <OutreachStatusBadge status={localRecord.status} />

                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-400"
                  value={localRecord.status}
                  onChange={(e) => handleStatusChange(e.target.value as OutreachStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>

                {localRecord.generated_pitch ? (
                  <button
                    type="button"
                    onClick={() => {
                      const lines = localRecord.generated_pitch!.split('\n')
                      const subjectLine = lines.find((l) => l.startsWith('Subject:'))
                      const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Pitch Email'
                      const body = lines.filter((l) => !l.startsWith('Subject:')).join('\n').trim()
                      setPitchResult({ subject, body })
                    }}
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    View Pitch
                  </button>
                ) : showModelPicker ? null : (
                  <button
                    type="button"
                    onClick={() => setShowModelPicker(true)}
                    disabled={generatingPitch}
                    className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    {generatingPitch ? 'Generating…' : 'Generate Pitch'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {showModelPicker && localRecord && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <ModelSelector value={model} onChange={setModel} />
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => setShowModelPicker(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePitch}
                className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>
        )}
      </div>

      {pitchResult && (
        <PitchEmailModal
          subject={pitchResult.subject}
          body={pitchResult.body}
          onClose={() => setPitchResult(null)}
        />
      )}
    </>
  )
}
