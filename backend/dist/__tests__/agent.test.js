"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
(0, vitest_1.describe)('Agent API', () => {
    let accessToken;
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.prisma.refreshToken.deleteMany();
        await prisma_1.prisma.agent.deleteMany();
        await prisma_1.prisma.user.deleteMany();
        // Create user and get token
        await (0, supertest_1.default)(app_1.default).post('/api/auth/signup').send({
            email: 'agent-test@example.com',
            password: 'password123',
            name: 'Agent Tester',
        });
        const loginRes = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: 'agent-test@example.com',
            password: 'password123',
        });
        accessToken = loginRes.body.data.accessToken;
    });
    (0, vitest_1.afterAll)(async () => {
        await prisma_1.prisma.$disconnect();
    });
    (0, vitest_1.it)('should create a new agent', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/agents')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            name: 'Test Agent',
            modelPreset: 'gpt-4o',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.agent.name).toBe('Test Agent');
    });
    (0, vitest_1.it)('should list user agents', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/agents')
            .set('Authorization', `Bearer ${accessToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(res.body.data.agents)).toBe(true);
        (0, vitest_1.expect)(res.body.data.agents.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should not create agent without auth', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/agents')
            .send({
            name: 'Unauthorized Agent',
            modelPreset: 'gpt-4o',
        });
        (0, vitest_1.expect)(res.status).toBe(401);
    });
});
