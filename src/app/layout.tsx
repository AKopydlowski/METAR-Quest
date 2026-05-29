import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import PwaRegister from "@/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "METAR Quest — trener pogody lotniczej",
  description: "Interaktywny dekoder METAR, briefing pogody na żywo i trening decyzji lotniczych.",
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
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><AppShell>{children}<PwaRegister /></AppShell></body>
    </html>
  );
}
