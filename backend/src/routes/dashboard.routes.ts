import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview);
router.get('/onboarding', dashboardController.getOnboarding);
router.post('/onboarding/bootstrap', dashboardController.bootstrapOnboarding);
router.post('/onboarding/verify', dashboardController.verifyFirstMessage);

export default router;
