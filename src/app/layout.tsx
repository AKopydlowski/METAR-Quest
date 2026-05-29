import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "METAR Quest — Pilot Weather Trainer",
  description: "Interactive METAR decoder, live weather briefing and aviation weather mission trainer.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><AppShell>{children}</AppShell></body>
    </html>
  );
}
