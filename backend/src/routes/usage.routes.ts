import { Router } from 'express';
import { usageController } from '../controllers/usage.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/log', usageController.logUsage);
router.get('/summary', usageController.getSummary);

export default router;
