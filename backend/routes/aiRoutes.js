import express from 'express';
import { generateAiResponse } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', generateAiResponse);

export default router;
