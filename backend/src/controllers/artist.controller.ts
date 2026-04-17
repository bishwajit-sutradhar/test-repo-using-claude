import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as artistService from '../services/artist.service'

export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  const artist = await artistService.getArtistByUserId(req.userId)
  if (!artist) {
    res.status(404).json({ error: 'Artist profile not found' })
    return
  }
  res.json(artist)
}

export async function createProfile(req: AuthenticatedRequest, res: Response) {
  const existing = await artistService.getArtistByUserId(req.userId)
  if (existing) {
    res.status(409).json({ error: 'Profile already exists. Use PUT to update.' })
    return
  }
  const artist = await artistService.createArtist(req.userId, req.body)
  res.status(201).json(artist)
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const artist = await artistService.updateArtist(req.userId, req.body)
  res.json(artist)
}
