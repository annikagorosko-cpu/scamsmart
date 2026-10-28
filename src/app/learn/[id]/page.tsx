"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/client";
import type { ModuleFull } from "@/lib/types";
import { Button, Card, ErrorBlock, LoadingBlock } from "@/components/ui";
import { ModuleIcon } from "@/components/module-icon";

export default function LearnPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [mod, setMod] = useState<ModuleFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<{ module: ModuleFull }>(`/api/modules/${id}`);
      setMod(data.module);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Moodulit ei õnnestunud laadida.");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function complete() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/modules/${id}/complete`, { method: "POST" });
      setCompleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvestamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !mod) return <ErrorBlock message={error} onRetry={load} />;
  if (!mod) return <LoadingBlock />;

  return (
    <article className="space-y-5">
      <Link href="/" className="text-sm text-emerald-800 underline">
        ← Tagasi moodulite juurde
      </Link>

      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <ModuleIcon name={mod.icon} className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold">{mod.title}</h1>
      </header>

      <p className="text-slate-700">{mod.intro}</p>

      <Card className="border-amber-200 bg-amber-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          Näide: {mod.scenario.channel}
        </p>
        <p className="mt-1 text-sm text-slate-600">Saatja: {mod.scenario.sender}</p>
        <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-white p-4 text-slate-800 shadow-sm">
          {mod.scenario.example}
        </blockquote>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" /> Hoiatusmärgid
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          {mod.warningSigns.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-800">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" /> Mida teha
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          {mod.safeActions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50">
        <h2 className="text-lg font-semibold text-emerald-900">Pea meeles</h2>
        <p className="mt-2 text-slate-800">{mod.takeaway}</p>
      </Card>

      {error && <ErrorBlock message={error} />}

      {completed ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Moodul on märgitud tehtuks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/test">
              <Button>Proovi ennast</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Teised moodulid</Button>
            </Link>
          </div>
        </div>
      ) : (
        <Button onClick={complete} disabled={saving}>
          {saving ? "Salvestan…" : "Märgi tehtuks"}
        </Button>
      )}
    </article>
  );
}
