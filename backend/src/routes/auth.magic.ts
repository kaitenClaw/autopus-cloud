// Magic Link Authentication Routes
// src/routes/auth.magic.ts

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  sendMagicLinkEmail,
  processMagicLink,
} from '../services/magicLink.service';

const router = Router();

/**
 * POST /api/auth/magic/request
 * Request a magic link for login or signup
 */
router.post(
  '/request',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('type').isIn(['login', 'signup']).withMessage('Type must be login or signup'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }
      
      const { email, type } = req.body;
      
      // Send magic link
      const result = await sendMagicLinkEmail(email, type);
      
      if (result.success) {
        // Always return success (prevents email enumeration)
        res.json({
          success: true,
          message: 'If an account exists with this email, you will receive a magic link shortly.',
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
      
    } catch (error) {
      console.error('Magic link request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process request',
      });
    }
  }
);

/**
 * GET /api/auth/magic/verify
 * Verify magic link token and authenticate user
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }
    
    // Process magic link
    const result = await processMagicLink(token);
    
    if (result.success) {
      // Return auth tokens and user info
      res.json({
        success: true,
        message: 'Authentication successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
    
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
});

export default router;
