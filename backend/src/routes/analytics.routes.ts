import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getDashboardAnalytics, getInsights } from '../controllers/analytics.controller';

const router = Router();
router.get('/dashboard', authenticate, getDashboardAnalytics);
router.get('/insights', authenticate, getInsights);

export default router;
