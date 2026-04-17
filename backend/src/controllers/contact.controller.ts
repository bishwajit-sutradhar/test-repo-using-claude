import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as contactService from '../services/contact.service'

export async function listContacts(req: AuthenticatedRequest, res: Response) {
  const contacts = await contactService.listContacts(req.userId)
  res.json(contacts)
}

export async function createContact(req: AuthenticatedRequest, res: Response) {
  const contact = await contactService.createContact(req.userId, req.body)
  res.status(201).json(contact)
}

export async function updateContact(req: AuthenticatedRequest, res: Response) {
  const contact = await contactService.updateContact(req.userId, req.params.id, req.body)
  res.json(contact)
}

export async function deleteContact(req: AuthenticatedRequest, res: Response) {
  await contactService.deleteContact(req.userId, req.params.id)
  res.status(204).send()
}

export async function listOutreachForKit(req: AuthenticatedRequest, res: Response) {
  const records = await contactService.listOutreachForKit(req.userId, req.params.kitId)
  res.json(records)
}

export async function upsertOutreachRecord(req: AuthenticatedRequest, res: Response) {
  const record = await contactService.upsertOutreachRecord(req.userId, req.body.contact_id, req.body.kit_id)
  res.status(201).json(record)
}

export async function updateOutreachStatus(req: AuthenticatedRequest, res: Response) {
  const record = await contactService.updateOutreachStatus(req.userId, req.params.recordId, req.body)
  res.json(record)
}

export async function generatePitchEmail(req: AuthenticatedRequest, res: Response) {
  const result = await contactService.generatePitchEmail(req.userId, req.body)
  res.json(result)
}
