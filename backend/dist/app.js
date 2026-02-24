"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("crypto");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const errors_1 = require("./utils/errors");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const agent_lifecycle_routes_1 = __importDefault(require("./routes/agent-lifecycle.routes"));
const agents_routes_1 = __importDefault(require("./routes/agents.routes")); // PULSE coordination
const system_routes_1 = __importDefault(require("./routes/system.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const hub_routes_1 = __importDefault(require("./routes/hub.routes"));
const usage_routes_1 = __importDefault(require("./routes/usage.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const skills_routes_1 = __importDefault(require("./routes/skills.routes"));
const authenticate_1 = require("./middleware/authenticate");
const requireAdmin_1 = require("./middleware/requireAdmin");
const app = (0, express_1.default)();
// Security & Optimization Middleware
app.set('trust proxy', 1); // Trust first proxy (Nginx/Docker)
app.use((req, res, next) => {
    const incoming = req.header('x-request-id');
    const requestId = incoming && incoming.trim().length > 0 ? incoming : (0, crypto_1.randomUUID)();
    res.setHeader('x-request-id', requestId);
    res.locals.requestId = requestId;
    next();
});
app.use((0, helmet_1.default)());
const allowedOrigins = env_1.env.ALLOWED_ORIGINS
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use((0, compression_1.default)());
// Body size limits - prevent DoS via large payloads
app.use(express_1.default.json({ limit: '100kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100kb' }));
app.use((0, cookie_parser_1.default)());
// Global Rate Limiter - Stricter for production security
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: (req) => {
        // Authenticated users: 60 requests/min, Anonymous: 30 requests/min
        return req.header('authorization') ? 60 : 30;
    },
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
        res.status(429).json({ message: 'Too many requests from this IP, please try again after a minute' });
    },
    message: { message: 'Too many requests from this IP, please try again after a minute' }
});
app.use(globalLimiter);
const authenticatedReadLimiter = (0, express_rate_limit_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env_1.env.NODE_ENV === 'development' ? 1000 : 10, // Relaxed in dev, strict in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts from this IP, please try again after an hour' }
});
// Health Check - Simplified to prevent hanging
const appStartTime = Date.now();
app.get(['/health', '/api/health'], async (_req, res) => {
    // Quick health check without external dependencies
    res.json({
        status: 'ok',
        version: '1.0.0',
        uptime: Date.now() - appStartTime,
        services: {
            database: 'unknown', // Will be checked separately
            litellm: 'unknown',
        },
    });
});
// Routes
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/agents', agent_routes_1.default);
app.use('/api/agents', agent_lifecycle_routes_1.default);
app.use('/api/agents', agents_routes_1.default); // PULSE coordination & status
app.use('/api/system', system_routes_1.default);
app.use('/api/admin', authenticate_1.authenticate, requireAdmin_1.requireAdmin, admin_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/hub', hub_routes_1.default);
app.use('/api/usage', usage_routes_1.default);
app.use('/api/billing', billing_routes_1.default);
app.use('/api/skills', skills_routes_1.default);
// 404 Handler
app.use((req, res, next) => {
    next(new errors_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
