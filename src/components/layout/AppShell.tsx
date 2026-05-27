"use client";

import { useEffect } from "react";
import Navbar from "./Navbar";
import { LanguageProvider } from "./LanguageProvider";
import { loadSettings } from "@/lib/storage/gameStorage";

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    const settings = loadSettings();
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    document.body.classList.toggle("text-lg", settings.fontScale === "large");
    document.body.classList.toggle("contrast-125", settings.highContrast);
  }, []);

  return (
    <LanguageProvider>
      <div className="flex min-h-full flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </LanguageProvider>
  );
}
