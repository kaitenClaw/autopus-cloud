import { Router } from 'express';
import { z } from 'zod';
import { agentController } from '../controllers/agent.controller';
import { chatController } from '../controllers/chat.controller';
import { sessionController } from '../controllers/session.controller';
import { configController } from '../controllers/config.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    modelPreset: z.string(),
  }),
});

const bulkCreateAgentsSchema = z.object({
  body: z.object({
    agents: z
      .array(
        z.object({
          name: z.string().min(1),
          modelPreset: z.string().min(1).optional(),
          model: z.string().min(1).optional(),
        })
      )
      .min(1)
      .max(1),
    autoStart: z.boolean().optional(),
  }),
});

const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    stream: z.boolean().optional(),
  }),
});

const updateConfigSchema = z.object({
  body: z.object({
    systemPrompt: z.string().optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    maxTokens: z.number().min(1).optional(),
    stopSequences: z.array(z.string()).optional(),
  }),
});

const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    memoryScope: z.enum(['WORKSPACE', 'GLOBAL']).optional(),
  }),
});

router.use(authenticate);

router.post('/', validate(createAgentSchema), agentController.create);
router.post('/bulk-create', validate(bulkCreateAgentsSchema), agentController.bulkCreate);
router.get('/presets', agentController.getPresets);
router.get('/', agentController.list);
router.get('/:id', agentController.getOne);
router.delete('/:id', agentController.delete);
router.post('/:id/start', agentController.start);
router.post('/:id/stop', agentController.stop);

// Chat routes
router.post('/:id/message', validate(sendMessageSchema), chatController.sendMessage);
router.get('/:id/messages', chatController.getHistory);

// Session routes
router.get('/:id/sessions', sessionController.list);
router.post('/:id/sessions', validate(createSessionSchema), sessionController.create);

// Config routes
router.get('/:id/config', configController.getConfig);
router.patch('/:id/config', validate(updateConfigSchema), configController.updateConfig);

// Legacy/Alternative chat route
router.post('/:id/chat', agentController.chat);

export default router;
