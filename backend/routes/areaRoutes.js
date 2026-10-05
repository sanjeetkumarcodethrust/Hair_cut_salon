import express from 'express';
import { searchAreas, reverseSearch } from '../controllers/areaController.js';

const router = express.Router();

router.get('/search', searchAreas);
router.get('/reverse', reverseSearch);

export default router;
