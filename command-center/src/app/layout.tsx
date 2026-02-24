import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Autopus — Your AI Persona Companion',
  description: 'Activate your first Intelligent Agent. It has memory, learns from you, and grows with you. Local or Cloud, your data stays yours. An AI companion that truly knows you.',
  keywords: ['AI Agent', 'AI Persona', 'Jarvis AI', 'Personal AI', 'AI Companion', 'Agent Platform'],
  openGraph: {
    title: 'Autopus — Activate Your AI Companion',
    description: 'An AI with memory that learns your preferences and grows with you',
    image: 'https://autopus.cloud/og-agent-companion.jpg',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autopus — Your AI Persona',
    description: 'Activate your AI companion. With memory, evolution, and true understanding',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F0] text-[#2B2D42]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
