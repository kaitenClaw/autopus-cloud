import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'KAITEN Hub',
  description: 'AI Agent Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
