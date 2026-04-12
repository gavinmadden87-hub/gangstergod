import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GangsterGodOS — Heartless 575 Swarm",
  description: "36 cold-blooded agents running in parallel. One command. Total empire execution. No love. Only dominance. Built for operators who move in silence and strike with precision.",
  keywords: ["Heartless 575", "GangsterGodOS", "Skull & Straps", "AI Swarm", "streetwear empire", "no love"],
  authors: [{ name: "Gavin Madden" }],
  openGraph: {
    title: "GangsterGodOS — Heartless 575 Swarm",
    description: "36 ruthless agents. Zero mercy. Empire mode activated.",
    images: [{ url: "https://yourdomain.com/og-image.jpg" }], // replace later with your logo
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-black text-white antialiased font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
