import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listTransactions } from '../controllers/transaction.controller';

const router = Router();
router.get('/', authenticate, listTransactions);

export default router;
