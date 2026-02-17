import { Router } from 'express';
import { z } from 'zod';
import { agentController } from '../controllers/agent.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    modelPreset: z.string(),
  }),
});

router.use(authenticate);

router.post('/', validate(createAgentSchema), agentController.create);
router.get('/', agentController.list);
router.get('/:id', agentController.getOne);
router.delete('/:id', agentController.delete);

export default router;
