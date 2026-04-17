import { useEffect, useState } from 'react'
import { useContacts, useOutreach, CreateContactPayload } from '../hooks/useContacts'
import { useEPKit } from '../hooks/useEPKit'
import { ContactCard } from '../components/contacts/ContactCard'
import { OutreachRow } from '../components/contacts/OutreachRow'
import { ContactType, EPKit } from '../types'
import { Spinner } from '../components/ui/Spinner'
import { useToastStore } from '../components/ui/Toast'

const TYPE_TABS: Array<{ key: ContactType | 'all'; label: string }> = [
  { key: 'all',     label: 'All' },
  { key: 'press',   label: 'Press' },
  { key: 'curator', label: 'Curator' },
  { key: 'radio',   label: 'Radio' },
]

const EMPTY_FORM: CreateContactPayload = {
  name: '', email: '', publication: '', contact_type: 'press', notes: '', website_url: '',
}

export function ContactsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const { contacts, loading: contactsLoading, fetchContacts, createContact, updateContact, deleteContact } = useContacts()
  const { kits, fetchKits } = useEPKit()
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<CreateContactPayload>(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)
  const [selectedKitId, setSelectedKitId] = useState('')

  const { records, loading: outreachLoading, fetchOutreach, addContactToKit, updateStatus, generatePitch } = useOutreach(selectedKitId)

  useEffect(() => {
    fetchContacts()
    fetchKits()
  }, [fetchContacts, fetchKits])

  useEffect(() => {
    if (selectedKitId) fetchOutreach()
  }, [selectedKitId, fetchOutreach])

  const handleAddContact = async () => {
    if (!form.name || !form.email) return
    setFormSaving(true)
    await createContact({
      ...form,
      publication: form.publication || undefined,
      notes: form.notes || undefined,
      website_url: form.website_url || undefined,
    }).catch((e: Error) => {
      addToast(e.message || 'Failed to add contact', 'error')
    })
    setFormSaving(false)
    setShowAddForm(false)
    setForm(EMPTY_FORM)
    addToast('Contact added', 'success')
  }

  const handleDelete = async (id: string) => {
    await deleteContact(id).catch((e: Error) => addToast(e.message || 'Failed to delete', 'error'))
    addToast('Contact removed', 'success')
  }

  const filteredContacts = typeFilter === 'all'
    ? contacts
    : contacts.filter((c) => c.contact_type === typeFilter)

  const completedKits = (kits as EPKit[]).filter((k) => k.generation_status === 'complete')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Press & Outreach</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your press contacts and track outreach status per release.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Contacts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Contacts</h2>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
              >
                + Add Contact
              </button>
            </div>

            {showAddForm && (
              <div className="mb-4 p-4 rounded-xl bg-brand-50 border border-brand-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                      placeholder="Jamie Oliver"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                      placeholder="jamie@pitchfork.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Publication</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                      placeholder="Pitchfork"
                      value={form.publication}
                      onChange={(e) => setForm({ ...form, publication: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Type *</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-400"
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
                      placeholder="Covers indie folk and alternative"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM) }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddContact}
                    disabled={formSaving || !form.name || !form.email}
                    className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                  >
                    {formSaving ? 'Saving…' : 'Add Contact'}
                  </button>
                </div>
              </div>
            )}

            {/* Type filter tabs */}
            <div className="flex border-b border-gray-100 mb-4">
              {TYPE_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTypeFilter(t.key)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                    typeFilter === t.key
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-gray-300">
                    {t.key === 'all' ? contacts.length : contacts.filter((c) => c.contact_type === t.key).length}
                  </span>
                </button>
              ))}
            </div>

            {contactsLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : filteredContacts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                {contacts.length === 0
                  ? 'No contacts yet. Add your first press contact above.'
                  : 'No contacts in this category.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    onUpdate={updateContact}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Outreach tracking */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Outreach Tracker</h2>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Select Release</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-400"
                value={selectedKitId}
                onChange={(e) => setSelectedKitId(e.target.value)}
              >
                <option value="">— Pick a kit —</option>
                {completedKits.map((k) => (
                  <option key={k.id} value={k.id}>{k.ep_title}</option>
                ))}
              </select>
            </div>

            {!selectedKitId ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Select a kit above to track outreach.
              </p>
            ) : outreachLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Add contacts first to track outreach.
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => {
                  const record = records.find((r) => r.contact_id === c.id)
                  return (
                    <OutreachRow
                      key={c.id}
                      contact={c}
                      record={record}
                      kitId={selectedKitId}
                      onAddToKit={addContactToKit}
                      onUpdateStatus={updateStatus}
                      onGeneratePitch={generatePitch}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
