import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Auth API', () => {
  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should not signup a user with an existing email', async () => {
    await request(app).post('/api/auth/signup').send(testUser);
    
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(409);
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should logout a user', async () => {
    await request(app).post('/api/auth/signup').send(testUser);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
  });
});
