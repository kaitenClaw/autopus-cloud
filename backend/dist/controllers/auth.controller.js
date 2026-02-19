"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
class AuthController {
    constructor() {
        this.signup = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const startedAt = Date.now();
            const requestId = this.getRequestId(req, res);
            const { email, password, name } = req.body;
            const emailDomain = this.getEmailDomain(email);
            try {
                const user = await auth_service_1.authService.signup(email, password, name);
                this.logAuthEvent({
                    action: 'signup',
                    outcome: 'success',
                    requestId,
                    durationMs: Date.now() - startedAt,
                    statusCode: 201,
                    emailDomain,
                });
                res.status(201).json({ status: 'success', data: { user } });
            }
            catch (error) {
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
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const startedAt = Date.now();
            const requestId = this.getRequestId(req, res);
            const { email, password } = req.body;
            const emailDomain = this.getEmailDomain(email);
            try {
                const { user, accessToken, refreshToken } = await auth_service_1.authService.login(email, password);
                // Set refresh token in httpOnly cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: env_1.env.NODE_ENV === 'production',
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
            }
            catch (error) {
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
        this.googleLogin = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const startedAt = Date.now();
            const requestId = this.getRequestId(req, res);
            const { token } = req.body;
            try {
                const { user, accessToken, refreshToken } = await auth_service_1.authService.googleLogin(token);
                // Set refresh token in httpOnly cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: env_1.env.NODE_ENV === 'production',
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
            }
            catch (error) {
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
        this.refresh = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
                const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.authService.refresh(token);
                res.cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: env_1.env.NODE_ENV === 'production',
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
            }
            catch (error) {
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
        this.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const startedAt = Date.now();
            const requestId = this.getRequestId(req, res);
            const token = req.cookies.refreshToken;
            try {
                if (token) {
                    await auth_service_1.authService.logout(token);
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
            }
            catch (error) {
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
    getRequestId(req, res) {
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
    getErrorStatusCode(error) {
        if (error instanceof errors_1.AppError)
            return error.statusCode;
        if (typeof error === 'object' && error !== null && 'statusCode' in error) {
            const statusCode = error.statusCode;
            if (typeof statusCode === 'number')
                return statusCode;
        }
        return undefined;
    }
    classifyOutcome(error) {
        const status = this.getErrorStatusCode(error);
        if (status && status >= 400 && status < 500)
            return 'client_error';
        return 'server_error';
    }
    getEmailDomain(email) {
        if (!email || typeof email !== 'string')
            return undefined;
        const domain = email.split('@')[1]?.trim().toLowerCase();
        return domain || undefined;
    }
    logAuthEvent(params) {
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
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
