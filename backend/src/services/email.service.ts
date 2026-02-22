// Email Service
// src/services/email.service.ts

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // If SMTP not configured, log to console (dev mode)
  if (!process.env.SMTP_HOST) {
    console.log('📧 Email (SMTP not configured):');
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   Preview: ${options.html.substring(0, 200)}...`);
    return;
  }
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@autopus.cloud',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ''),
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const html = `
    <h1>Welcome to Autopus! 🎉</h1>
    <p>Hi ${name},</p>
    <p>Welcome to Autopus - the "Uber for Intelligence". You're now part of a community building the future of AI-powered work.</p>
    <h3>What's next?</h3>
    <ul>
      <li>🤖 Create your first AI partner</li>
      <li>🔌 Install skills from the marketplace</li>
      <li>💬 Start collaborating via Telegram or dashboard</li>
    </ul>
    <p><a href="https://dashboard.autopus.cloud">Go to Dashboard →</a></p>
    <hr>
    <p>Questions? Reply to this email or visit our documentation.</p>
  `;
  
  await sendEmail({
    to: email,
    subject: 'Welcome to Autopus! 🚀',
    html,
  });
}
