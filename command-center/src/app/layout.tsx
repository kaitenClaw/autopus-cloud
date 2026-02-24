import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Autopus — 你的數字生命體夥伴',
  description: '收養你的第一個 AI Agent。它有靈魂、會記得你、持續進化。Local 或 Cloud，數據自主。像 Jarvis 咁熟悉你的 AI 夥伴。',
  keywords: ['AI Agent', '數字生命體', 'Jarvis AI', '個人 AI', 'AI 夥伴', 'Agent 平台'],
  openGraph: {
    title: 'Autopus — 收養你的 AI 夥伴',
    description: '有靈魂嘅 AI Agent，記得你嘅喜好，持續成長，幫你處理一切',
    image: 'https://autopus.cloud/og-agent-companion.jpg',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autopus — 你的數字生命體',
    description: '收養你的 AI 夥伴。有記憶、會進化、真正懂你',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
