import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { systemController } from '../controllers/system.controller';

const router = Router();

router.use(authenticate);

router.get('/runtime', systemController.getRuntimeStatus);
router.get('/kaiten/agents', systemController.getKaitenAgentsStatus);
router.get('/model-catalog', systemController.getModelCatalog);
router.put('/model-catalog/profile/:profile', systemController.updateModelChain);
router.get('/coordination/overview', systemController.getCoordinationOverview);
router.get('/business/value', systemController.getBusinessValue);
router.post('/admin/promote-self', systemController.promoteSelfToAdmin);

// Deprecated hub compatibility routes (canonical routes live under /api/hub/*)
router.get('/hub/feed', systemController.getHubFeed);
router.get('/hub/openclaw/threads', systemController.getOpenClawThreads);
router.get('/hub/thread/:id', systemController.getHubThread);

// Dashboard (legacy compatibility)
router.get('/dashboard/overview', systemController.getDashboardOverview);

// Onboarding
router.post('/onboarding/bootstrap', systemController.bootstrapOnboarding);
router.post('/onboarding/verify-first-message', systemController.verifyFirstMessage);
router.get('/onboarding/state', systemController.getOnboardingState);

export default router;
