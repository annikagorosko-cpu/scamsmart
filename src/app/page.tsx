"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/client";
import type { ModuleSummary, Progress } from "@/lib/types";
import { Card, ErrorBlock, LoadingBlock } from "@/components/ui";
import { ModuleIcon } from "@/components/module-icon";

export default function HomePage() {
  const [modules, setModules] = useState<ModuleSummary[] | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, p] = await Promise.all([
        apiFetch<{ modules: ModuleSummary[] }>("/api/modules"),
        apiFetch<Progress>("/api/progress"),
      ]);
      setModules(m.modules);
      setDone(p.completedModuleIds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Andmeid ei õnnestunud laadida.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Õpi pettusi ära tundma</h1>
        <p className="mt-2 text-slate-600">
          Neli lühikest moodulit näitavad, kuidas pettused välja näevad ja mida teha. Pärast saad
          end testida.
        </p>
      </section>

      {error && <ErrorBlock message={error} onRetry={load} />}
      {!modules && !error && <LoadingBlock />}

      <div className="grid gap-4 sm:grid-cols-2">
        {modules?.map((m) => (
          <Link key={m.id} href={`/learn/${m.id}`} className="group block">
            <Card className="h-full transition group-hover:border-emerald-400 group-hover:shadow">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <ModuleIcon name={m.icon} className="h-6 w-6" />
                </span>
                {done.includes(m.id) && (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Tehtud
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold">{m.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{m.intro}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
