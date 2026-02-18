import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { systemController } from '../controllers/system.controller';

const router = Router();

router.use(authenticate);

router.get('/runtime', systemController.getRuntimeStatus);
router.get('/kaiten/agents', systemController.getKaitenAgentsStatus);
router.post('/admin/promote-self', systemController.promoteSelfToAdmin);

export default router;
