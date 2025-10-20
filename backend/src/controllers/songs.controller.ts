import { Request, Response } from 'express';
import { searchSongsTab4U, getSongContentFromTab4U } from '../utils/scrapeTab4U';

export async function searchSongs(req: Request, res: Response) {
  const query = req.query.query as string;
  if (!query) return void res.status(400).json({ error: 'Missing query parameter' });
  try {
    const songs = await searchSongsTab4U(query);
    if (!songs.length) return void res.status(404).json({ message: 'No songs found' });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSongContent(req: Request, res: Response) {
  const link = req.query.link as string;
  if (!link) return void res.status(400).json({ error: 'Missing link parameter' });
  try {
    const full = await getSongContentFromTab4U(link);
    res.json(full);  // { contentHtml, chords, lyrics, rawText, ...}
  } catch (error) {
    console.error('Failed to fetch song content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}