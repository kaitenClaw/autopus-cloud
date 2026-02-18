import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Chat API Streaming', () => {
  let accessToken: string;
  let agentId: string;

    beforeAll(async () => {
    await prisma.message.deleteMany();
    await prisma.agentConfig.deleteMany();
    await prisma.usage.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    const email = 'chat-stream-test@example.com';
    await request(app).post('/api/auth/signup').send({
      email,
      password: 'password123',
      name: 'Stream Tester',
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
        name: 'Chat Agent',
        modelPreset: 'gpt-4o',
      });
    
    agentId = agentRes.body.data.agent.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should stream SSE when stream=true (mock-safe path)', async () => {
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: 'RUNNING' }
    });

    const res = await request(app)
      .post(`/api/agents/${agentId}/message`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        message: 'Hi',
        stream: true
      });

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/event-stream');
    
    expect(res.text).toContain('data: {"type":"token"');
    expect(res.text).toContain('data: {"type":"done"');

    const assistantMessage = await prisma.message.findFirst({
      where: { agentId, role: 'assistant' },
      orderBy: { createdAt: 'desc' }
    });
    expect(assistantMessage?.content).toContain('[Mock] Agent Chat Agent is RUNNING');
  });

  it('should still support non-streaming when stream=false', async () => {
    const res = await request(app)
      .post(`/api/agents/${agentId}/message`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        message: 'Hi again',
        stream: false
      });

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/json');
    expect(res.body.data.assistantMessage.content).toContain('[Mock] Agent Chat Agent is RUNNING');
  });
});
