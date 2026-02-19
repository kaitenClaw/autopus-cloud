import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

type AuthAction = 'signup' | 'login' | 'google_login' | 'refresh' | 'logout';
type AuthOutcome = 'success' | 'client_error' | 'server_error';

export class AuthController {
  private getRequestId(req: Request, res: Response): string {
    const fromLocals = res.locals?.requestId;
    if (typeof fromLocals === 'string' && fromLocals.trim().length > 0) {
      return fromLocals;
    }
    const fromHeader = req.header('x-request-id');
    if (fromHeader && fromHeader.trim().length > 0) {
      return fromHeader;
    }
    return 'unknown';
  }

  private getErrorStatusCode(error: unknown): number | undefined {
    if (error instanceof AppError) return error.statusCode;
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const statusCode = (error as { statusCode?: unknown }).statusCode;
      if (typeof statusCode === 'number') return statusCode;
    }
    return undefined;
  }

  private classifyOutcome(error: unknown): AuthOutcome {
    const status = this.getErrorStatusCode(error);
    if (status && status >= 400 && status < 500) return 'client_error';
    return 'server_error';
  }

  private getEmailDomain(email?: string): string | undefined {
    if (!email || typeof email !== 'string') return undefined;
    const domain = email.split('@')[1]?.trim().toLowerCase();
    return domain || undefined;
  }

  private logAuthEvent(params: {
    action: AuthAction;
    outcome: AuthOutcome | 'success';
    requestId: string;
    durationMs: number;
    statusCode: number;
    emailDomain?: string;
    errorCode?: string;
  }) {
    const payload = {
      event: 'auth_request',
      action: params.action,
      outcome: params.outcome,
      requestId: params.requestId,
      statusCode: params.statusCode,
      durationMs: params.durationMs,
      emailDomain: params.emailDomain ?? null,
      errorCode: params.errorCode ?? null,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(payload));
  }

  signup = asyncHandler(async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const requestId = this.getRequestId(req, res);
    const { email, password, name } = req.body;
    const emailDomain = this.getEmailDomain(email);

    try {
      const user = await authService.signup(email, password, name);
      this.logAuthEvent({
        action: 'signup',
        outcome: 'success',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 201,
        emailDomain,
      });
      res.status(201).json({ status: 'success', data: { user } });
    } catch (error) {
      const statusCode = this.getErrorStatusCode(error) ?? 500;
      this.logAuthEvent({
        action: 'signup',
        outcome: this.classifyOutcome(error),
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode,
        emailDomain,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const requestId = this.getRequestId(req, res);
    const { email, password } = req.body;
    const emailDomain = this.getEmailDomain(email);

    try {
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      this.logAuthEvent({
        action: 'login',
        outcome: 'success',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 200,
        emailDomain,
      });

      res.json({
        status: 'success',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      const statusCode = this.getErrorStatusCode(error) ?? 500;
      this.logAuthEvent({
        action: 'login',
        outcome: this.classifyOutcome(error),
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode,
        emailDomain,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }

  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const requestId = this.getRequestId(req, res);
    const { token } = req.body;
    try {
      const { user, accessToken, refreshToken } = await authService.googleLogin(token);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      this.logAuthEvent({
        action: 'google_login',
        outcome: 'success',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 200,
      });

      res.json({
        status: 'success',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      const statusCode = this.getErrorStatusCode(error) ?? 500;
      this.logAuthEvent({
        action: 'google_login',
        outcome: this.classifyOutcome(error),
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const requestId = this.getRequestId(req, res);
    const token = req.cookies.refreshToken;
    if (!token) {
      this.logAuthEvent({
        action: 'refresh',
        outcome: 'client_error',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 401,
        errorCode: 'MissingRefreshToken',
      });
      return res.status(401).json({ status: 'error', message: 'No refresh token' });
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      this.logAuthEvent({
        action: 'refresh',
        outcome: 'success',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 200,
      });

      res.json({
        status: 'success',
        data: { accessToken }
      });
    } catch (error) {
      const statusCode = this.getErrorStatusCode(error) ?? 500;
      this.logAuthEvent({
        action: 'refresh',
        outcome: this.classifyOutcome(error),
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const requestId = this.getRequestId(req, res);
    const token = req.cookies.refreshToken;
    try {
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie('refreshToken');
      this.logAuthEvent({
        action: 'logout',
        outcome: 'success',
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode: 200,
      });
      res.json({ status: 'success', message: 'Logged out' });
    } catch (error) {
      const statusCode = this.getErrorStatusCode(error) ?? 500;
      this.logAuthEvent({
        action: 'logout',
        outcome: this.classifyOutcome(error),
        requestId,
        durationMs: Date.now() - startedAt,
        statusCode,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }
  });
}

export const authController = new AuthController();
