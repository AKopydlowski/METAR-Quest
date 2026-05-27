import Link from "next/link";

const routes = [
  { href: "/learn", label: "Learn" },
  { href: "/decode", label: "Decode" },
  { href: "/quiz", label: "Quiz" },
  { href: "/time-attack", label: "Time Attack" },
  { href: "/real-weather", label: "Real Weather" },
  { href: "/progress", label: "Progress" },
];

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <main className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">METAR Quest</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Choose a mode to get started.
        </p>

        <nav aria-label="Main routes" className="mt-6 grid gap-3 sm:grid-cols-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-md border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
