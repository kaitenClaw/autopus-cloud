import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { env } from '../config/env';

export class AuthController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const user = await authService.signup(email, password, name);
    res.status(201).json({ status: 'success', data: { user } });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
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

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      data: { accessToken }
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie('refreshToken');
    res.json({ status: 'success', message: 'Logged out' });
  });
}

export const authController = new AuthController();
