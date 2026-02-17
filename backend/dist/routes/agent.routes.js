"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const agent_controller_1 = require("../controllers/agent.controller");
const authenticate_1 = require("../middleware/authenticate");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createAgentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        modelPreset: zod_1.z.string(),
    }),
});
router.use(authenticate_1.authenticate);
router.post('/', (0, validate_1.validate)(createAgentSchema), agent_controller_1.agentController.create);
router.get('/', agent_controller_1.agentController.list);
router.get('/:id', agent_controller_1.agentController.getOne);
router.delete('/:id', agent_controller_1.agentController.delete);
exports.default = router;
