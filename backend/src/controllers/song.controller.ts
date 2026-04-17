import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as songService from '../services/song.service'

export async function listSongs(req: AuthenticatedRequest, res: Response) {
  const songs = await songService.getSongs(req.userId)
  res.json(songs)
}

export async function createSong(req: AuthenticatedRequest, res: Response) {
  const song = await songService.createSong(req.userId, req.body)
  res.status(201).json(song)
}

export async function updateSong(req: AuthenticatedRequest, res: Response) {
  const song = await songService.updateSong(req.userId, req.params.id, req.body)
  res.json(song)
}

export async function deleteSong(req: AuthenticatedRequest, res: Response) {
  await songService.deleteSong(req.userId, req.params.id)
  res.status(204).send()
}
