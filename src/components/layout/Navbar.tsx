"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { loadSettings, saveSettings, type GameSettings } from "@/lib/storage/gameStorage";

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return <Link href={href} onClick={onClick} className={`rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-foreground text-background" : "text-foreground/80 hover:bg-foreground/10"}`}>{label}</Link>;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const navItems = [{ href: "/", label: t("home") }, { href: "/learn", label: t("learn") }, { href: "/decode", label: t("decode") }, { href: "/quiz", label: t("quiz") }, { href: "/time-attack", label: t("timeAttack") }, { href: "/real-weather", label: t("realWeather") }, { href: "/progress", label: t("progress") }];

  const toggleTheme = () => {
    const s = loadSettings();
    const next: GameSettings = { ...s, theme: s.theme === "dark" ? "light" : "dark" };
    saveSettings(next);
    document.documentElement.classList.toggle("dark", next.theme === "dark");
  };

  return <header className="border-b border-foreground/10 bg-background/95"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"><Link href="/" className="font-semibold">🛩️ {t("appName")}</Link><nav className="hidden md:flex">{navItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} />)}</nav><div className="flex items-center gap-2"><select value={language} onChange={(e) => setLanguage(e.target.value as "pl"|"en")} className="rounded-md border border-foreground/20 bg-background px-2 py-1"><option value="pl">PL</option><option value="en">EN</option></select><button onClick={toggleTheme} className="rounded border border-foreground/30 px-2 py-1 text-xs hover:bg-foreground/10">🌓</button><button type="button" className="md:hidden" onClick={() => setIsOpen((o) => !o)}>{isOpen ? t("close") : t("menu")}</button></div></div>
  <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>{navItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} onClick={() => setIsOpen(false)} />)}</div></header>;
}
