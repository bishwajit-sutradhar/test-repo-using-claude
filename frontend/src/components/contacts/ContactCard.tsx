import { useState } from 'react'
import { PressContact, ContactType } from '../../types'
import { CreateContactPayload } from '../../hooks/useContacts'

const TYPE_LABELS: Record<ContactType, string> = {
  press: 'Press',
  curator: 'Curator',
  radio: 'Radio',
}

interface ContactCardProps {
  contact: PressContact
  onUpdate: (id: string, data: Partial<CreateContactPayload>) => Promise<PressContact>
  onDelete: (id: string) => Promise<void>
}

export function ContactCard({ contact, onUpdate, onDelete }: ContactCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email,
    publication: contact.publication ?? '',
    contact_type: contact.contact_type,
    notes: contact.notes ?? '',
    website_url: contact.website_url ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(contact.id, {
      ...form,
      publication: form.publication || undefined,
      notes: form.notes || undefined,
      website_url: form.website_url || undefined,
    })
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Publication</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              value={form.publication}
              onChange={(e) => setForm({ ...form, publication: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Type *</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 bg-white"
              value={form.contact_type}
              onChange={(e) => setForm({ ...form, contact_type: e.target.value as ContactType })}
            >
              <option value="press">Press</option>
              <option value="curator">Curator</option>
              <option value="radio">Radio</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.name || !form.email}
            className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {TYPE_LABELS[contact.contact_type]}
            </span>
          </div>
          {contact.publication && (
            <p className="text-xs text-gray-500 mt-0.5">{contact.publication}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{contact.email}</p>
          {contact.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">{contact.notes}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-brand-600 px-2 py-1 rounded transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(contact.id)}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
