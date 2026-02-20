import express from 'express';
import { randomUUID } from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';
import { prisma } from './config/prisma';

import authRoutes from './routes/auth.routes';
import agentRoutes from './routes/agent.routes';
import agentLifecycleRoutes from './routes/agent-lifecycle.routes';
import systemRoutes from './routes/system.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import hubRoutes from './routes/hub.routes';
import usageRoutes from './routes/usage.routes';
import { authenticate } from './middleware/authenticate';
import { requireAdmin } from './middleware/requireAdmin';

const app = express();

// Security & Optimization Middleware
app.set('trust proxy', 1); // Trust first proxy (Nginx/Docker)
app.use((req, res, next) => {
  const incoming = req.header('x-request-id');
  const requestId = incoming && incoming.trim().length > 0 ? incoming : randomUUID();
  res.setHeader('x-request-id', requestId);
  res.locals.requestId = requestId;
  next();
});
app.use(helmet());
const allowedOrigins = env.ALLOWED_ORIGINS
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const isRead = req.method === 'GET';
    const isDashboardRead = req.path.startsWith('/api/system') || req.path.startsWith('/api/hub');
    const hasAuth = Boolean(req.header('authorization'));
    return isRead && isDashboardRead && hasAuth;
  },
  handler: (req, res) => {
    const requestId = String(res.locals.requestId || '');
    const userId = req.header('authorization') ? 'authenticated' : 'anonymous';
    console.warn(JSON.stringify({
      event: 'rate_limit_hit',
      limiter: 'global',
      route: req.originalUrl,
      method: req.method,
      user: userId,
      requestId,
      timestamp: new Date().toISOString(),
    }));
    res.status(429).json({ message: 'Too many requests from this IP, please try again after 15 minutes' });
  },
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(globalLimiter);

const authenticatedReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'GET' || !Boolean(req.header('authorization')),
  handler: (req, res) => {
    const requestId = String(res.locals.requestId || '');
    console.warn(JSON.stringify({
      event: 'rate_limit_hit',
      limiter: 'authenticated_read',
      route: req.originalUrl,
      method: req.method,
      user: 'authenticated',
      requestId,
      timestamp: new Date().toISOString(),
    }));
    res.status(429).json({ message: 'Too many dashboard reads. Please retry shortly.' });
  },
  message: { message: 'Too many dashboard reads. Please retry shortly.' }
});
app.use(['/api/system', '/api/hub'], authenticatedReadLimiter);

// Auth Rate Limiter (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'development' ? 1000 : 10, // Relaxed in dev, strict in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP, please try again after an hour' }
});

// Health Check
const appStartTime = Date.now();
app.get('/health', async (_req, res) => {
  const uptimeMs = Date.now() - appStartTime;
  const hours = Math.floor(uptimeMs / 3600000);
  const minutes = Math.floor((uptimeMs % 3600000) / 60000);

  let database: 'connected' | 'disconnected' = 'disconnected';
  let agentStats = { total: 0, running: 0, stopped: 0 };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
    const counts = await prisma.agent.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });
    for (const row of counts) {
      agentStats.total += row._count;
      if (row.status === 'RUNNING') agentStats.running = row._count;
      if (row.status === 'STOPPED') agentStats.stopped = row._count;
    }
  } catch {
    // DB unreachable — return degraded status
  }

  res.json({
    status: database === 'connected' ? 'ok' : 'degraded',
    version: '0.2.0',
    database,
    uptime: `${hours}h ${minutes}m`,
    agents: agentStats,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/agents', agentLifecycleRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/admin', authenticate, requireAdmin, adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hub', hubRoutes);
app.use('/api/usage', usageRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
