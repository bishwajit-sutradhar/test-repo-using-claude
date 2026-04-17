import { useState } from 'react'
import { useToastStore } from '../ui/Toast'

interface PitchEmailModalProps {
  subject: string
  body: string
  onClose: () => void
}

export function PitchEmailModal({ subject, body, onClose }: PitchEmailModalProps) {
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const copySubject = async () => {
    await navigator.clipboard.writeText(subject)
    setCopiedSubject(true)
    addToast('Subject copied', 'success')
    setTimeout(() => setCopiedSubject(false), 2000)
  }

  const copyBody = async () => {
    await navigator.clipboard.writeText(body)
    setCopiedBody(true)
    addToast('Email body copied', 'success')
    setTimeout(() => setCopiedBody(false), 2000)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    addToast('Full email copied', 'success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Generated Pitch Email</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyAll}
              className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Copy All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Subject */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject Line</p>
              <button
                type="button"
                onClick={copySubject}
                className="text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-0.5 rounded hover:bg-brand-50"
              >
                {copiedSubject ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-900">{subject}</p>
          </div>

          {/* Body */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Body</p>
              <button
                type="button"
                onClick={copyBody}
                className="text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-0.5 rounded hover:bg-brand-50"
              >
                {copiedBody ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
