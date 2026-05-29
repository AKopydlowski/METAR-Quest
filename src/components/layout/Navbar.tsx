"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { loadSettings, saveSettings, type GameSettings } from "@/lib/storage/gameStorage";

type NavItem = { href: string; label: string };

function NavLink({ href, label, onClick, compact = false }: { href: string; label: string; onClick?: () => void; compact?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center rounded-full font-semibold transition-all duration-200 active:scale-95 ${
        compact ? "px-3 py-2 text-sm" : "px-4 py-2 text-sm"
      } ${isActive ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-foreground/78 hover:bg-foreground/10 hover:text-foreground"}`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const primaryItems: NavItem[] = [
    { href: "/", label: t("home") },
    { href: "/learn", label: t("learn") },
    { href: "/decode", label: t("decode") },
    { href: "/quiz", label: t("quiz") },
    { href: "/missions", label: t("missions") },
  ];
  const secondaryItems: NavItem[] = [
    { href: "/time-attack", label: t("timeAttack") },
    { href: "/exam", label: t("exam") },
    { href: "/real-weather", label: t("realWeather") },
    { href: "/briefing-lab", label: t("briefingLab") },
    { href: "/leaderboard", label: t("leaderboard") },
    { href: "/progress", label: t("progress") },
    { href: "/onboarding", label: t("onboarding") },
  ];

  useEffect(() => {
    const closeOnClick = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", closeOnClick);
    return () => document.removeEventListener("mousedown", closeOnClick);
  }, []);

  const toggleTheme = () => {
    const s = loadSettings();
    const next: GameSettings = { ...s, theme: s.theme === "dark" ? "light" : "dark" };
    saveSettings(next);
    document.documentElement.classList.toggle("dark", next.theme === "dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2 rounded-full px-2 py-1 font-black tracking-tight transition active:scale-95">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:-rotate-6 group-hover:scale-105">✈️</span>
          <span>{t("appName")}</span>
        </Link>

        <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-2xl shadow-slate-950/10 md:flex" aria-label="Główna nawigacja">
          {primaryItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} />)}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-foreground/78 transition hover:bg-foreground/10 hover:text-foreground active:scale-95"
              aria-expanded={moreOpen}
            >
              {t("more")} <span className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>
            <div className={`absolute right-0 top-12 w-64 origin-top-right rounded-3xl border border-white/10 bg-slate-950/95 p-2 text-white shadow-2xl shadow-slate-950/40 backdrop-blur transition-all duration-200 ${moreOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
              {secondaryItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} onClick={() => setMoreOpen(false)} compact />)}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200 sm:inline-flex">PL</span>
          <button onClick={toggleTheme} className="rounded-full border border-foreground/20 px-3 py-2 text-sm transition hover:bg-foreground/10 active:scale-95" aria-label="Przełącz motyw">🌓</button>
          <button type="button" className="rounded-full border border-foreground/20 px-3 py-2 text-sm font-semibold transition hover:bg-foreground/10 active:scale-95 md:hidden" onClick={() => setIsOpen((o) => !o)} aria-expanded={isOpen}>
            {isOpen ? t("close") : t("menu")}
          </button>
        </div>
      </div>
      <div className={`overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 md:hidden ${isOpen ? "max-h-[34rem] opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="mx-auto grid w-full max-w-6xl gap-1 px-4 py-3 sm:px-6" aria-label="Nawigacja mobilna">
          {[...primaryItems, ...secondaryItems].map((item) => <NavLink key={item.href} href={item.href} label={item.label} onClick={() => setIsOpen(false)} compact />)}
        </nav>
      </div>
    </header>
  );
}
