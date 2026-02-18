"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
(0, vitest_1.describe)('Auth API', () => {
    (0, vitest_1.beforeEach)(async () => {
        await prisma_1.prisma.message.deleteMany();
        await prisma_1.prisma.agentConfig.deleteMany();
        await prisma_1.prisma.usage.deleteMany();
        await prisma_1.prisma.agent.deleteMany();
        await prisma_1.prisma.refreshToken.deleteMany();
        await prisma_1.prisma.subscription.deleteMany();
        await prisma_1.prisma.user.deleteMany();
    });
    (0, vitest_1.afterAll)(async () => {
        await prisma_1.prisma.$disconnect();
    });
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
    };
    (0, vitest_1.it)('should signup a new user', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/signup')
            .send(testUser);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.user.email).toBe(testUser.email);
    });
    (0, vitest_1.it)('should not signup a user with an existing email', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/signup').send(testUser);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/signup')
            .send(testUser);
        (0, vitest_1.expect)(res.status).toBe(409);
    });
    (0, vitest_1.it)('should login an existing user', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/signup').send(testUser);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password,
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.data).toHaveProperty('accessToken');
        (0, vitest_1.expect)(res.headers['set-cookie']).toBeDefined();
    });
    (0, vitest_1.it)('should logout a user', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/signup').send(testUser);
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password,
        });
        const cookie = loginRes.headers['set-cookie'];
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/logout')
            .set('Cookie', cookie);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
    });
});
