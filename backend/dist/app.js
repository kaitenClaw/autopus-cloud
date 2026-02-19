"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const errors_1 = require("./utils/errors");
const prisma_1 = require("./config/prisma");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const agent_lifecycle_routes_1 = __importDefault(require("./routes/agent-lifecycle.routes"));
const system_routes_1 = __importDefault(require("./routes/system.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const hub_routes_1 = __importDefault(require("./routes/hub.routes"));
const authenticate_1 = require("./middleware/authenticate");
const requireAdmin_1 = require("./middleware/requireAdmin");
const app = (0, express_1.default)();
// Security & Optimization Middleware
app.set('trust proxy', 1); // Trust first proxy (Nginx/Docker)
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(globalLimiter);
// Auth Rate Limiter (Brute-force protection)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env_1.env.NODE_ENV === 'development' ? 1000 : 10, // Relaxed in dev, strict in prod
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
    let database = 'disconnected';
    let agentStats = { total: 0, running: 0, stopped: 0 };
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        database = 'connected';
        const counts = await prisma_1.prisma.agent.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: true,
        });
        for (const row of counts) {
            agentStats.total += row._count;
            if (row.status === 'RUNNING')
                agentStats.running = row._count;
            if (row.status === 'STOPPED')
                agentStats.stopped = row._count;
        }
    }
    catch {
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
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/agents', agent_routes_1.default);
app.use('/api/agents', agent_lifecycle_routes_1.default);
app.use('/api/system', system_routes_1.default);
app.use('/api/admin', authenticate_1.authenticate, requireAdmin_1.requireAdmin, admin_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/hub', hub_routes_1.default);
// 404 Handler
app.use((req, res, next) => {
    next(new errors_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
