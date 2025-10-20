import Router from 'express';
import { searchSongs, getSongContent } from '../controllers/songs.controller';

const router = Router();


router.get('/search-songs', searchSongs);
router.get('/get-song-content', getSongContent);

export default router;
