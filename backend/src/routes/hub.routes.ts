import { Router } from 'express';
import { hubController } from '../controllers/hub.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/feed', hubController.getFeed);
router.get('/thread/:threadId', hubController.getThread);
router.get('/openclaw/threads', hubController.getOpenClawThreads);
router.get('/openclaw/thread/:threadId', hubController.getOpenClawThread);

export default router;
