import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('System API', () => {
  let userOneToken: string;
  let userTwoToken: string;
  let userOneId: string;
  let userTwoId: string;
  let userOneAgentId: string;
  let userTwoAgentId: string;
  let userOneSessionId: string;
  let userTwoSessionId: string;

  beforeAll(async () => {
    await prisma.usage.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chatSession.deleteMany();
    await prisma.agentConfig.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/api/auth/signup').send({
      email: 'system-one@example.com',
      password: 'password123',
      name: 'System One',
    });

    await request(app).post('/api/auth/signup').send({
      email: 'system-two@example.com',
      password: 'password123',
      name: 'System Two',
    });

    const userOneLogin = await request(app).post('/api/auth/login').send({
      email: 'system-one@example.com',
      password: 'password123',
    });
    userOneToken = userOneLogin.body.data.accessToken;

    const userTwoLogin = await request(app).post('/api/auth/login').send({
      email: 'system-two@example.com',
      password: 'password123',
    });
    userTwoToken = userTwoLogin.body.data.accessToken;

    const [userOne, userTwo] = await Promise.all([
      prisma.user.findUnique({ where: { email: 'system-one@example.com' } }),
      prisma.user.findUnique({ where: { email: 'system-two@example.com' } }),
    ]);

    if (!userOne || !userTwo) {
      throw new Error('Failed to resolve test users');
    }

    userOneId = userOne.id;
    userTwoId = userTwo.id;

    await prisma.user.update({
      where: { id: userOneId },
      data: { role: 'ADMIN' },
    });

    const relogin = await request(app).post('/api/auth/login').send({
      email: 'system-one@example.com',
      password: 'password123',
    });
    userOneToken = relogin.body.data.accessToken;

    const userOneAgentRes = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'Prime',
        modelPreset: 'google-antigravity/gemini-3-flash',
      });
    userOneAgentId = userOneAgentRes.body.data.agent.id;

    const userTwoAgentRes = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({
        name: 'Forge',
        modelPreset: 'anthropic/claude-3.5-haiku',
      });
    userTwoAgentId = userTwoAgentRes.body.data.agent.id;

    const userOneSessionRes = await request(app)
      .post(`/api/agents/${userOneAgentId}/sessions`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ title: 'User One Ops', memoryScope: 'WORKSPACE' });
    userOneSessionId = userOneSessionRes.body.data.session.id;

    const userTwoSessionRes = await request(app)
      .post(`/api/agents/${userTwoAgentId}/sessions`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({ title: 'User Two Ops', memoryScope: 'GLOBAL' });
    userTwoSessionId = userTwoSessionRes.body.data.session.id;

    await prisma.message.createMany({
      data: [
        {
          agentId: userOneAgentId,
          sessionId: userOneSessionId,
          role: 'user',
          content: 'user-one-private-message',
        },
        {
          agentId: userOneAgentId,
          sessionId: userOneSessionId,
          role: 'system',
          content: 'prime handing to forge',
          metadata: {
            direction: 'agent_to_agent',
            fromAgent: 'Prime',
            toAgent: 'Forge',
            route: 'handoff-chain',
            reason: 'specialist escalation',
          },
        },
        {
          agentId: userTwoAgentId,
          sessionId: userTwoSessionId,
          role: 'user',
          content: 'user-two-private-message',
        },
      ],
    });

    await prisma.usage.createMany({
      data: [
        {
          userId: userOneId,
          agentId: userOneAgentId,
          tokens: 120,
          model: 'google-antigravity/gemini-3-flash',
        },
        {
          userId: userTwoId,
          agentId: userTwoAgentId,
          tokens: 999,
          model: 'anthropic/claude-3.5-haiku',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('scopes hub feed to the authenticated user and exposes agent handoffs', async () => {
    const res = await request(app)
      .get('/api/system/hub/feed')
      .query({ limit: 200 })
      .set('Authorization', `Bearer ${userOneToken}`);

    expect(res.status).toBe(200);
    const events = res.body.data.events as Array<any>;
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.agent?.id === userOneAgentId)).toBe(true);
    expect(events.some((event) => event.content === 'user-two-private-message')).toBe(false);

    const handoff = events.find((event) => event.direction === 'agent_to_agent');
    expect(handoff).toBeDefined();
    expect(handoff.participants).toEqual({
      from: 'Prime',
      to: 'Forge',
    });
    // expect(events.every((event) => event.scope === 'workspace')).toBe(true);
  });

  it('scopes dashboard aggregates to the authenticated user', async () => {
    const res = await request(app)
      .get('/api/system/dashboard/overview')
      .set('Authorization', `Bearer ${userOneToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.database.total).toBe(1);
    // expect(res.body.data.usage.requests24h).toBe(1);
    expect(res.body.data.usage.tokens24h).toBe(120);
    expect(res.body.data.models.some((row: any) => row.model === 'google-antigravity/gemini-3-flash')).toBe(true);
    expect(res.body.data.models.some((row: any) => row.model === 'anthropic/claude-3.5-haiku')).toBe(false);
    expect(res.body.data.recentSessions.every((session: any) => session.agent.id === userOneAgentId)).toBe(true);
    expect(res.body.data.memoryScopes.GLOBAL).toBe(0);
    expect(res.body.data.coordination.agents.length).toBe(1);
    expect(res.body.data.onboarding).toBeDefined();
  });

  it('blocks non-admin users from system and aggregate hub scopes', async () => {
    const systemRes = await request(app)
      .get('/api/system/hub/feed')
      .query({ scope: 'system' })
      .set('Authorization', `Bearer ${userTwoToken}`);
    expect(systemRes.status).toBe(403);

    const aggregateRes = await request(app)
      .get('/api/system/hub/feed')
      .query({ scope: 'aggregate' })
      .set('Authorization', `Bearer ${userTwoToken}`);
    expect(aggregateRes.status).toBe(403);
  });

  it('supports admin system scope and thread drilldown', async () => {
    const systemRes = await request(app)
      .get('/api/system/hub/feed')
      .query({ scope: 'system', eventTypes: 'task_transition,system', limit: 50 })
      .set('Authorization', `Bearer ${userOneToken}`);

    expect(systemRes.status).toBe(200);
    expect(systemRes.body.data.scope).toBe('system');
    expect(Array.isArray(systemRes.body.data.events)).toBe(true);

    const threadRes = await request(app)
      .get(`/api/system/hub/thread/${userOneSessionId}`)
      .set('Authorization', `Bearer ${userOneToken}`);
    expect(threadRes.status).toBe(200);
    expect(threadRes.body.data.threadId).toBe(userOneSessionId);
    expect(Array.isArray(threadRes.body.data.events)).toBe(true);
    expect(threadRes.body.data.events.length).toBeGreaterThan(0);
  });

  it('executes onboarding bootstrap and first-message verification', async () => {
    const bootstrapRes = await request(app)
      .post('/api/system/onboarding/bootstrap')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({ mode: 'first_agent', autoStart: false });

    expect(bootstrapRes.status).toBe(200);
    expect(bootstrapRes.body.data.state).toBeDefined();

    const verifyRes = await request(app)
      .post('/api/system/onboarding/verify-first-message')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({});

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.state.status).toBe('completed');
    expect(verifyRes.body.data.threadId).toBeDefined();

    const stateRes = await request(app)
      .get('/api/system/onboarding/state')
      .set('Authorization', `Bearer ${userTwoToken}`);

    expect(stateRes.status).toBe(200);
    expect(stateRes.body.data.state.firstMessageVerified).toBe(true);
  });
});
