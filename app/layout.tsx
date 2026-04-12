import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

export const metadata = {
  title: "Gangster God OS",
  description: "Move with discipline, silence, and unshakeable control."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
