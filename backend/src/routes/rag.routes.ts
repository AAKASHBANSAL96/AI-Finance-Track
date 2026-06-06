import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { seedKnowledgeBase } from '../controllers/rag.controller';

const router = Router();
router.post('/seed', authenticate, seedKnowledgeBase);

export default router;
