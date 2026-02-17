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
const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
class AuthService {
    async signup(email, password, name) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_ROUNDS);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
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
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const tokens = this.generateTokens(user.id);
        // Store refresh token in DB
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
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
        const tokens = this.generateTokens(refreshTokenRecord.userId);
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
    generateTokens(userId) {
        const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
