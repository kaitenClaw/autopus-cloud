import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { UserRole } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const PLACEHOLDER_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'];

export class AuthService {
  private readonly adminEmails: Set<string>;

  constructor() {
    this.adminEmails = new Set(
      env.ADMIN_EMAILS.split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  async googleLogin(idToken: string) {
    const client = new OAuth2Client();
    let payload;
    try {
      // Validate the token with proper audience check
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID, 
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedError('Invalid Google token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedError('Invalid Google token payload');
    }

    const { email, name, picture } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Create user if not exists (JIT provisioning)
      const randomPassword = await bcrypt.hash(Math.random().toString(36), BCRYPT_ROUNDS);
      
      // Determine role: Fion is a standard user, Alton's list are admins
      const isAdmin = this.adminEmails.has(normalizedEmail);
      const role: UserRole = isAdmin ? 'ADMIN' : 'USER';

      user = await prisma.user.create({
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
    await prisma.refreshToken.create({
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

  async signup(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const role: UserRole = this.adminEmails.has(normalizedEmail) ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
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

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const effectiveUser = await this.maybePromoteUserToAdmin(user.id, user.email, user.role);
    const tokens = this.generateTokens(effectiveUser.id, effectiveUser.role);

    // Store refresh token in DB
    await prisma.refreshToken.create({
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

  async refresh(token: string) {
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      if (refreshTokenRecord) {
        await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokens = this.generateTokens(refreshTokenRecord.userId, refreshTokenRecord.user.role);

    // Rotate refresh token: delete old, create new
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } }),
      prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: refreshTokenRecord.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return tokens;
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  private isPlaceholderEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? PLACEHOLDER_EMAIL_DOMAINS.includes(domain) : false;
  }

  private async maybePromoteUserToAdmin(userId: string, email: string, role: UserRole) {
    if (role === 'ADMIN') {
      return prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
      });
    }

    const normalizedEmail = email.toLowerCase();
    const emailIsConfiguredAdmin = this.adminEmails.has(normalizedEmail);
    const existingAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const shouldBootstrapAdmin = existingAdminCount === 0 && !this.isPlaceholderEmail(normalizedEmail);

    if (!emailIsConfiguredAdmin && !shouldBootstrapAdmin) {
      return prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
  }

  private generateTokens(userId: string, role: UserRole) {
    const accessToken = jwt.sign(
      { userId, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
