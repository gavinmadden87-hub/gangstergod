import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: "Gangster God OS",
  description: "Move with discipline, silence, and unshakeable control."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
