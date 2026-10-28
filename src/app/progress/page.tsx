"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import type { Progress } from "@/lib/types";
import { Button, Card, ErrorBlock, LoadingBlock } from "@/components/ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("et-EE", { dateStyle: "short", timeStyle: "short" });
}

export default function ProgressPage() {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await apiFetch<Progress>("/api/progress"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Andmeid ei õnnestunud laadida.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function reset() {
    if (!window.confirm("Kas kustutan kogu sinu edasijõudmise sellest seadmest?")) return;
    setResetting(true);
    try {
      await apiFetch("/api/progress", { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kustutamine ebaõnnestus.");
    } finally {
      setResetting(false);
    }
  }

  if (error && !data) return <ErrorBlock message={error} onRetry={load} />;
  if (!data) return <LoadingBlock />;

  const best = data.quizRuns.reduce((m, r) => Math.max(m, r.correct), 0);
  const weakest = data.accuracyByModule
    .filter((m) => m.total > 0)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Minu edasijõudmine</h1>
      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Läbitud moodulid</p>
          <p className="mt-1 text-2xl font-bold">
            {data.completedModuleIds.length} / {data.totalModules}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Tehtud teste</p>
          <p className="mt-1 text-2xl font-bold">{data.quizRuns.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Parim tulemus</p>
          <p className="mt-1 text-2xl font-bold">{data.quizRuns.length ? best : "–"}</p>
        </Card>
      </div>

      {weakest && weakest.correct < weakest.total && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-slate-800">
            Kõige rohkem on veel õppida teemas <strong>{weakest.title}</strong>. Vaata see moodul
            uuesti üle.
          </p>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Õigeid vastuseid teemade kaupa</h2>
        <div className="space-y-3">
          {data.accuracyByModule.map((m) => (
            <Card key={m.moduleId} className="p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{m.title}</span>
                <span className="text-slate-500">{m.total ? `${m.correct} / ${m.total}` : "Pole veel vastanud"}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: m.total ? `${(m.correct / m.total) * 100}%` : "0%" }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Testide ajalugu</h2>
        {data.quizRuns.length === 0 ? (
          <p className="text-slate-600">Sa pole veel testi teinud.</p>
        ) : (
          <ul className="space-y-2">
            {data.quizRuns.map((r) => (
              <li key={r.quizRunId} className="flex justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span>{formatDate(r.date)}</span>
                <span className="font-semibold">
                  {r.correct} / {r.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="danger" onClick={reset} disabled={resetting}>
        {resetting ? "Kustutan…" : "Kustuta minu edasijõudmine"}
      </Button>
    </div>
  );
}
