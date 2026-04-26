import type { Metadata } from "next";
import { ReactNode } from "react";
import "../styles/globals.css";
import { ToastProvider } from "../components/toast";

export const metadata: Metadata = {
  title: "GANGSTERGODOS - HEARTLESS 575",
  description: "36 cold-blooded agents. One command. Total empire execution.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
