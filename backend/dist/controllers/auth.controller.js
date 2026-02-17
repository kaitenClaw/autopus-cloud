"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
class AuthController {
    constructor() {
        this.signup = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { email, password, name } = req.body;
            const user = await auth_service_1.authService.signup(email, password, name);
            res.status(201).json({ status: 'success', data: { user } });
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await auth_service_1.authService.login(email, password);
            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.json({
                status: 'success',
                data: {
                    user,
                    accessToken
                }
            });
        });
        this.refresh = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const token = req.cookies.refreshToken;
            if (!token) {
                return res.status(401).json({ status: 'error', message: 'No refresh token' });
            }
            const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.authService.refresh(token);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({
                status: 'success',
                data: { accessToken }
            });
        });
        this.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const token = req.cookies.refreshToken;
            if (token) {
                await auth_service_1.authService.logout(token);
            }
            res.clearCookie('refreshToken');
            res.json({ status: 'success', message: 'Logged out' });
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
