import { Router } from 'express';
import { skillsController } from '../controllers/skills.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public — browse marketplace
router.get('/', skillsController.list);
router.get('/:slug', skillsController.getBySlug);

// Auth required — install/uninstall for user's agents
router.post('/:slug/install', authenticate, skillsController.install);
router.delete('/:slug/install/:agentId', authenticate, skillsController.uninstall);
router.get('/installed/:agentId', authenticate, skillsController.getInstalledForAgent);

export default router;
