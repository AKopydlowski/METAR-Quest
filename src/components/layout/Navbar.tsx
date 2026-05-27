"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/decode", label: "Decode" },
  { href: "/quiz", label: "Quiz" },
  { href: "/time-attack", label: "Time Attack" },
  { href: "/real-weather", label: "Real Weather" },
  { href: "/progress", label: "Progress" },
];

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          METAR Quest
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-foreground/20 p-2 text-sm md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">Toggle menu</span>
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div id="mobile-nav" className={`${isOpen ? "block" : "hidden"} border-t border-foreground/10 md:hidden`}>
        <nav className="mx-auto grid w-full max-w-6xl gap-1 px-4 py-3 sm:px-6" aria-label="Mobile primary">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
