"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const google_auth_library_1 = require("google-auth-library");
const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const PLACEHOLDER_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'];
class AuthService {
    constructor() {
        this.adminEmails = new Set(env_1.env.ADMIN_EMAILS.split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean));
    }
    async googleLogin(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        let payload;
        try {
            // Validate the token with proper audience check
            const ticket = await client.verifyIdToken({
                idToken,
                audience: env_1.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid Google token');
        }
        if (!payload || !payload.email) {
            throw new errors_1.UnauthorizedError('Invalid Google token payload');
        }
        const { email, name, picture } = payload;
        const normalizedEmail = email.trim().toLowerCase();
        // Check if user exists
        let user = await prisma_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            // Create user if not exists (JIT provisioning)
            const randomPassword = await bcrypt_1.default.hash(Math.random().toString(36), BCRYPT_ROUNDS);
            // Determine role: Fion is a standard user, Alton's list are admins
            const isAdmin = this.adminEmails.has(normalizedEmail);
            const role = isAdmin ? 'ADMIN' : 'USER';
            user = await prisma_1.prisma.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash: randomPassword,
                    name: name || payload.given_name || (normalizedEmail.includes('fion') ? 'Fion' : 'User'),
                    role,
                    subscription: {
                        create: {
                            tier: isAdmin ? 'PRO' : 'FREE',
                            maxAgents: isAdmin ? 10 : 1,
                            maxTokensPerDay: isAdmin ? 1000000 : 10000,
                        },
                    },
                },
            });
        }
        // Determine effective user/role (admin promotion logic)
        const effectiveUser = await this.maybePromoteUserToAdmin(user.id, user.email, user.role);
        const tokens = this.generateTokens(effectiveUser.id, effectiveUser.role);
        // Store refresh token
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: effectiveUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return {
            user: {
                id: effectiveUser.id,
                email: effectiveUser.email,
                name: effectiveUser.name,
                role: effectiveUser.role,
                picture,
            },
            ...tokens,
        };
    }
    async signup(email, password, name) {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_ROUNDS);
        const role = this.adminEmails.has(normalizedEmail) ? 'ADMIN' : 'USER';
        const user = await prisma_1.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                name,
                role,
                subscription: {
                    create: {
                        tier: 'FREE',
                        maxAgents: 1,
                        maxTokensPerDay: 10000,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        return user;
    }
    async login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const effectiveUser = await this.maybePromoteUserToAdmin(user.id, user.email, user.role);
        const tokens = this.generateTokens(effectiveUser.id, effectiveUser.role);
        // Store refresh token in DB
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: effectiveUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return {
            user: {
                id: effectiveUser.id,
                email: effectiveUser.email,
                name: effectiveUser.name,
                role: effectiveUser.role,
            },
            ...tokens,
        };
    }
    async refresh(token) {
        const refreshTokenRecord = await prisma_1.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
            if (refreshTokenRecord) {
                await prisma_1.prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
            }
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        const tokens = this.generateTokens(refreshTokenRecord.userId, refreshTokenRecord.user.role);
        // Rotate refresh token: delete old, create new
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } }),
            prisma_1.prisma.refreshToken.create({
                data: {
                    token: tokens.refreshToken,
                    userId: refreshTokenRecord.userId,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            }),
        ]);
        return tokens;
    }
    async logout(token) {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { token } });
    }
    isPlaceholderEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        return domain ? PLACEHOLDER_EMAIL_DOMAINS.includes(domain) : false;
    }
    async maybePromoteUserToAdmin(userId, email, role) {
        if (role === 'ADMIN') {
            return prisma_1.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: { id: true, email: true, name: true, role: true }
            });
        }
        const normalizedEmail = email.toLowerCase();
        const emailIsConfiguredAdmin = this.adminEmails.has(normalizedEmail);
        const existingAdminCount = await prisma_1.prisma.user.count({ where: { role: 'ADMIN' } });
        const shouldBootstrapAdmin = existingAdminCount === 0 && !this.isPlaceholderEmail(normalizedEmail);
        if (!emailIsConfiguredAdmin && !shouldBootstrapAdmin) {
            return prisma_1.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: { id: true, email: true, name: true, role: true }
            });
        }
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
            select: { id: true, email: true, name: true, role: true }
        });
    }
    generateTokens(userId, role) {
        const accessToken = jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
