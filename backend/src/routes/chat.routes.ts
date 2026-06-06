import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendChatQuery } from '../controllers/chat.controller';

const router = Router();
router.post('/', authenticate, sendChatQuery);

export default router;
