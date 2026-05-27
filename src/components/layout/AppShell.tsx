"use client";

import Navbar from "./Navbar";
import { LanguageProvider } from "./LanguageProvider";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <div className="flex min-h-full flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
