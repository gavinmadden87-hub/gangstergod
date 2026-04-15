import { Analytics } from '@vercel/analytics/next';
import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: "Gangster God OS",
  description: "Move with discipline, silence, and unshakeable control."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
