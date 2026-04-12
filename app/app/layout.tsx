import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GangsterGodOS — Heartless 575 Swarm",
  description: "36 cold-blooded agents. One command. Total empire execution. No love. Only dominance.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
