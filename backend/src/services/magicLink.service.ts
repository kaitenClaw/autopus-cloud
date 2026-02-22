// Magic Link Authentication Service
// src/services/magicLink.service.ts

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email.service';

const prisma = new PrismaClient();

const MAGIC_LINK_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-secret';
const MAGIC_LINK_EXPIRY = '15m'; // 15 minutes
const BASE_URL = process.env.FRONTEND_URL || 'https://dashboard.autopus.cloud';

export interface MagicLinkPayload {
  email: string;
  type: 'login' | 'signup';
}

/**
 * Generate a magic link token for email authentication
 */
export function generateMagicToken(email: string, type: 'login' | 'signup'): string {
  return jwt.sign(
    { email: email.toLowerCase().trim(), type },
    MAGIC_LINK_SECRET,
    { expiresIn: MAGIC_LINK_EXPIRY }
  );
}

/**
 * Verify a magic link token
 */
export function verifyMagicToken(token: string): MagicLinkPayload | null {
  try {
    const decoded = jwt.verify(token, MAGIC_LINK_SECRET) as MagicLinkPayload;
    return decoded;
  } catch (error) {
    console.error('Magic link verification failed:', error);
    return null;
  }
}

/**
 * Send magic link email to user
 */
export async function sendMagicLinkEmail(
  email: string, 
  type: 'login' | 'signup'
): Promise<{ success: boolean; message: string }> {
  try {
    // Generate token
    const token = generateMagicToken(email, type);
    const magicLink = `${BASE_URL}/auth/magic?token=${token}`;
    
    // Determine email content
    const subject = type === 'signup' 
      ? 'Welcome to Autopus - Complete Your Signup'
      : 'Your Autopus Login Link';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .logo { text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: bold; color: #6366f1; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .expires { color: #dc2626; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="logo">🤖 Autopus</div>
        
        <h2>${type === 'signup' ? 'Welcome to Autopus!' : 'Login to Autopus'}</h2>
        
        <p>Hi there,</p>
        
        <p>${type === 'signup' 
          ? "You're almost ready to start building with AI partners. Click the button below to complete your signup."
          : 'Click the button below to securely log in to your Autopus account.'
        }</p>
        
        <div style="text-align: center;">
          <a href="${magicLink}" class="button">${type === 'signup' ? 'Complete Signup' : 'Log In'}</a>
        </div>
        
        <p class="expires">⏰ This link expires in 15 minutes for security.</p>
        
        <p>Or copy and paste this URL into your browser:<br>
        <code>${magicLink}</code></p>
        
        <div class="footer">
          <p>If you didn't request this link, you can safely ignore this email.</p>
          <p>Autopus - Uber for Intelligence<br>
          <a href="https://autopus.cloud">autopus.cloud</a></p>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });
    
    console.log(`✅ Magic link sent to ${email} (${type})`);
    return { success: true, message: 'Magic link sent successfully' };
    
  } catch (error) {
    console.error('Failed to send magic link:', error);
    return { success: false, message: 'Failed to send magic link' };
  }
}

/**
 * Process magic link verification and return auth tokens
 */
export async function processMagicLink(
  token: string
): Promise<{
  success: boolean;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}> {
  // Verify token
  const payload = verifyMagicToken(token);
  if (!payload) {
    return { success: false, message: 'Invalid or expired magic link' };
  }
  
  const { email, type } = payload;
  
  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (type === 'signup') {
      if (user) {
        return { success: false, message: 'Account already exists. Please log in instead.' };
      }
      
      // Create new user
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash: randomPassword,
          subscription: {
            create: {
              tier: 'FREE',
              maxAgents: 1,
              maxTokensPerDay: 10000,
            },
          },
        },
      });
      
      console.log(`✅ New user created via magic link: ${email}`);
      
    } else {
      if (!user) {
        return { success: false, message: 'Account not found. Please sign up first.' };
      }
    }
    
    // Generate auth tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
    
  } catch (error) {
    console.error('Magic link processing failed:', error);
    return { success: false, message: 'Authentication failed' };
  }
}
