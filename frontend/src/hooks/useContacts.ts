import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { PressContact, OutreachRecord, OutreachStatus } from '../types'

export interface CreateContactPayload {
  name: string; email: string; publication?: string
  contact_type: 'press' | 'curator' | 'radio'
  notes?: string; website_url?: string
}

export function useContacts() {
  const [contacts, setContacts] = useState<PressContact[]>([])
  const [loading, setLoading] = useState(false)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const res = await apiClient.get<PressContact[]>('/api/contacts').catch((e) => { setLoading(false); throw e })
    setContacts(res.data)
    setLoading(false)
  }, [])

  const createContact = useCallback(async (data: CreateContactPayload): Promise<PressContact> => {
    const res = await apiClient.post<PressContact>('/api/contacts', data)
    setContacts((prev) => [res.data, ...prev])
    return res.data
  }, [])

  const updateContact = useCallback(async (id: string, data: Partial<CreateContactPayload>): Promise<PressContact> => {
    const res = await apiClient.put<PressContact>(`/api/contacts/${id}`, data)
    setContacts((prev) => prev.map((c) => c.id === id ? res.data : c))
    return res.data
  }, [])

  const deleteContact = useCallback(async (id: string) => {
    await apiClient.delete(`/api/contacts/${id}`)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { contacts, loading, fetchContacts, createContact, updateContact, deleteContact }
}

export function useOutreach(kitId: string) {
  const [records, setRecords] = useState<OutreachRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOutreach = useCallback(async () => {
    if (!kitId) return
    setLoading(true)
    const res = await apiClient.get<OutreachRecord[]>(`/api/contacts/outreach/${kitId}`).catch((e) => { setLoading(false); throw e })
    setRecords(res.data)
    setLoading(false)
  }, [kitId])

  const addContactToKit = useCallback(async (contactId: string): Promise<OutreachRecord> => {
    const res = await apiClient.post<OutreachRecord>('/api/contacts/outreach', { contact_id: contactId, kit_id: kitId })
    setRecords((prev) => [res.data, ...prev])
    return res.data
  }, [kitId])

  const updateStatus = useCallback(async (recordId: string, status: OutreachStatus, note?: string) => {
    const res = await apiClient.patch<OutreachRecord>(`/api/contacts/outreach/${recordId}/status`, { status, personal_note: note })
    setRecords((prev) => prev.map((r) => r.id === recordId ? res.data : r))
    return res.data
  }, [])

  const generatePitch = useCallback(async (
    contactId: string,
    provider: string,
    model: string
  ): Promise<{ subject: string; body: string }> => {
    const res = await apiClient.post('/api/contacts/outreach/pitch', { contact_id: contactId, kit_id: kitId, provider, model })
    // Refresh outreach to get updated generated_pitch
    const refreshed = await apiClient.get<OutreachRecord[]>(`/api/contacts/outreach/${kitId}`)
    setRecords(refreshed.data)
    return res.data
  }, [kitId])

  return { records, loading, fetchOutreach, addContactToKit, updateStatus, generatePitch }
}
