"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ListChecks, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

const ITEMS = [
  { href: "/", label: "Õpi", icon: BookOpen },
  { href: "/test", label: "Proovi ennast", icon: ListChecks },
  { href: "/progress", label: "Minu edasijõudmine", icon: BarChart3 },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          ScamSmart
        </Link>
        <nav className="flex gap-1" aria-label="Peamenüü">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" || pathname.startsWith("/learn") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium sm:flex-none",
                  active ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
