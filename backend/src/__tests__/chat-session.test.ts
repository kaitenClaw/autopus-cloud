import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Chat Session API', () => {
  let accessToken: string;
  let agentId: string;

  beforeAll(async () => {
    await prisma.usage.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chatSession.deleteMany();
    await prisma.agentConfig.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    const email = 'chat-session-test@example.com';
    await request(app).post('/api/auth/signup').send({
      email,
      password: 'password123',
      name: 'Session Tester',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });

    accessToken = loginRes.body.data.accessToken;

    const agentRes = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Session Agent',
        modelPreset: 'gpt-4o',
      });

    agentId = agentRes.body.data.agent.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create default session on first list call', async () => {
    const res = await request(app)
      .get(`/api/agents/${agentId}/sessions`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.sessions)).toBe(true);
    expect(res.body.data.sessions.length).toBeGreaterThan(0);
    expect(res.body.data.sessions[0].title).toBeTruthy();
  });

  it('should create custom session and scope message history to that session', async () => {
    const createSessionRes = await request(app)
      .post(`/api/agents/${agentId}/sessions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'UX Refinement',
        memoryScope: 'WORKSPACE',
      });

    expect(createSessionRes.status).toBe(201);
    const sessionId = createSessionRes.body.data.session.id as string;
    expect(createSessionRes.body.data.session.memoryScope).toBe('WORKSPACE');

    const sendRes = await request(app)
      .post(`/api/agents/${agentId}/message`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        message: 'Plan dashboard refinements',
        sessionId,
      });

    expect(sendRes.status).toBe(200);
    expect(sendRes.body.data.assistantMessage).toBeDefined();

    const historyRes = await request(app)
      .get(`/api/agents/${agentId}/messages`)
      .query({ sessionId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body.data.messages)).toBe(true);
    expect(historyRes.body.data.messages.length).toBe(2);
    expect(historyRes.body.data.messages[0].role).toBe('user');
    expect(historyRes.body.data.messages[1].role).toBe('assistant');
  });
});
