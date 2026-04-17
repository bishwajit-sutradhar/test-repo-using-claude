import { useState } from 'react'
import jsPDF from 'jspdf'
import { EPKit, KitContent } from '../../types'
import { Button } from '../ui/Button'
import { useToastStore } from '../ui/Toast'

interface KitExportButtonProps {
  kit: EPKit
}

function buildPlainText(title: string, content: KitContent): string {
  const lines: string[] = [
    `PRESS KIT — ${title.toUpperCase()}`,
    '═'.repeat(60),
    '',
    'ARTIST BIO',
    '─'.repeat(40),
    content.artist_bio,
    '',
    'EP OVERVIEW',
    '─'.repeat(40),
    content.ep_overview,
    '',
    'PRESS RELEASE',
    '─'.repeat(40),
    content.press_release,
    '',
    'TRACK DESCRIPTIONS',
    '─'.repeat(40),
    ...Object.entries(content.track_descriptions ?? {}).map(([t, d]) => `${t}\n${d}`),
    '',
    'SOCIAL MEDIA CAPTIONS',
    '─'.repeat(40),
    'Instagram:',
    content.social_captions?.instagram ?? '',
    '',
    'Twitter/X:',
    content.social_captions?.twitter ?? '',
    '',
    'TikTok:',
    content.social_captions?.tiktok ?? '',
    '',
    'STREAMING PITCH',
    '─'.repeat(40),
    content.streaming_pitch ?? '',
    '',
    'INTERVIEW TALKING POINTS',
    '─'.repeat(40),
    ...(content.interview_talking_points ?? []).map((p, i) => `${i + 1}. ${p}`),
  ]
  return lines.join('\n')
}

export function KitExportButton({ kit }: KitExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  if (!kit.content) return null

  const handlePDF = async () => {
    setExporting(true)
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2
    let y = margin

    const addText = (text: string, size: number, bold = false) => {
      pdf.setFontSize(size)
      pdf.setFont('helvetica', bold ? 'bold' : 'normal')
      const lineHeight = size * 1.4
      const pageHeight = pdf.internal.pageSize.getHeight() - margin
      const lines = pdf.splitTextToSize(text, pageWidth) as string[]
      for (const line of lines) {
        if (y + lineHeight > pageHeight) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin, y)
        y += lineHeight
      }
      y += 8
    }

    const content = kit.content as KitContent

    addText(`Press Kit — ${kit.ep_title}`, 18, true)
    y += 8
    addText('Artist Bio', 13, true)
    addText(content.artist_bio, 10)
    addText('EP Overview', 13, true)
    addText(content.ep_overview, 10)
    addText('Press Release', 13, true)
    addText(content.press_release, 10)
    addText('Track Descriptions', 13, true)
    Object.entries(content.track_descriptions ?? {}).forEach(([title, desc]) => {
      addText(title, 11, true)
      addText(desc, 10)
    })
    addText('Streaming Pitch', 13, true)
    addText(content.streaming_pitch ?? '', 10)
    addText('Interview Talking Points', 13, true)
    ;(content.interview_talking_points ?? []).forEach((p, i) => addText(`${i + 1}. ${p}`, 10))

    pdf.save(`${kit.ep_title.replace(/\s+/g, '_')}_Kit.pdf`)
    setExporting(false)
    addToast('PDF downloaded', 'success')
  }

  const handleCopy = async () => {
    const text = buildPlainText(kit.ep_title, kit.content as KitContent)
    await navigator.clipboard.writeText(text)
    addToast('Copied to clipboard', 'success')
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" loading={exporting} onClick={handlePDF}>
        Download PDF
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        Copy Text
      </Button>
    </div>
  )
}
