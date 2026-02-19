"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const agent_controller_1 = require("../controllers/agent.controller");
const chat_controller_1 = require("../controllers/chat.controller");
const session_controller_1 = require("../controllers/session.controller");
const config_controller_1 = require("../controllers/config.controller");
const authenticate_1 = require("../middleware/authenticate");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createAgentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        modelPreset: zod_1.z.string(),
    }),
});
const bulkCreateAgentsSchema = zod_1.z.object({
    body: zod_1.z.object({
        agents: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().min(1),
            modelPreset: zod_1.z.string().min(1).optional(),
            model: zod_1.z.string().min(1).optional(),
        }))
            .min(1)
            .max(1),
        autoStart: zod_1.z.boolean().optional(),
    }),
});
const sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1),
        stream: zod_1.z.boolean().optional(),
    }),
});
const updateConfigSchema = zod_1.z.object({
    body: zod_1.z.object({
        systemPrompt: zod_1.z.string().optional(),
        model: zod_1.z.string().optional(),
        temperature: zod_1.z.number().min(0).max(2).optional(),
        topP: zod_1.z.number().min(0).max(1).optional(),
        maxTokens: zod_1.z.number().min(1).optional(),
        stopSequences: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
const createSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        memoryScope: zod_1.z.enum(['WORKSPACE', 'GLOBAL']).optional(),
    }),
});
router.use(authenticate_1.authenticate);
router.post('/', (0, validate_1.validate)(createAgentSchema), agent_controller_1.agentController.create);
router.post('/bulk-create', (0, validate_1.validate)(bulkCreateAgentsSchema), agent_controller_1.agentController.bulkCreate);
router.get('/presets', agent_controller_1.agentController.getPresets);
router.get('/', agent_controller_1.agentController.list);
router.get('/:id', agent_controller_1.agentController.getOne);
router.delete('/:id', agent_controller_1.agentController.delete);
router.post('/:id/start', agent_controller_1.agentController.start);
router.post('/:id/stop', agent_controller_1.agentController.stop);
// Chat routes
router.post('/:id/message', (0, validate_1.validate)(sendMessageSchema), chat_controller_1.chatController.sendMessage);
router.get('/:id/messages', chat_controller_1.chatController.getHistory);
// Session routes
router.get('/:id/sessions', session_controller_1.sessionController.list);
router.post('/:id/sessions', (0, validate_1.validate)(createSessionSchema), session_controller_1.sessionController.create);
// Config routes
router.get('/:id/config', config_controller_1.configController.getConfig);
router.patch('/:id/config', (0, validate_1.validate)(updateConfigSchema), config_controller_1.configController.updateConfig);
// Legacy/Alternative chat route
router.post('/:id/chat', agent_controller_1.agentController.chat);
exports.default = router;
