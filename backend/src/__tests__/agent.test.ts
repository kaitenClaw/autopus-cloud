import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Agent API', () => {
  let accessToken: string;

    beforeAll(async () => {
    await prisma.message.deleteMany();
    await prisma.agentConfig.deleteMany();
    await prisma.usage.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    // Create user and get token
    await request(app).post('/api/auth/signup').send({
      email: 'agent-test@example.com',
      password: 'password123',
      name: 'Agent Tester',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'agent-test@example.com',
      password: 'password123',
    });

    accessToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new agent', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Agent',
        modelPreset: 'gpt-4o',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.agent.name).toBe('Test Agent');
  });

  it('should list user agents', async () => {
    const res = await request(app)
      .get('/api/agents')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.agents)).toBe(true);
    expect(res.body.data.agents.length).toBeGreaterThan(0);
  });

  it('should not create agent without auth', async () => {
    const res = await request(app)
      .post('/api/agents')
      .send({
        name: 'Unauthorized Agent',
        modelPreset: 'gpt-4o',
      });

    expect(res.status).toBe(401);
  });
});
