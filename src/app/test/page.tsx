"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import type { QuizQuestion, ResultBand } from "@/lib/types";
import { Button, Card, ErrorBlock, LoadingBlock } from "@/components/ui";
import { clsx } from "clsx";

type Feedback = { isCorrect: boolean; correctOptionKey: string; explanation: string; coach: string };

export default function TestPage() {
  const [quizRunId, setQuizRunId] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [bands, setBands] = useState<ResultBand[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setQuestions(null);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    try {
      const data = await apiFetch<{ quizRunId: string; questions: QuizQuestion[]; resultBands: ResultBand[] }>(
        "/api/questions",
      );
      setQuizRunId(data.quizRunId);
      setQuestions(data.questions);
      setBands(data.resultBands);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Küsimusi ei õnnestunud laadida.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function answer(key: string) {
    if (!questions || feedback || busy) return;
    setSelected(key);
    setBusy(true);
    setError(null);
    try {
      const fb = await apiFetch<Feedback>("/api/attempts", {
        method: "POST",
        body: JSON.stringify({ questionId: questions[index].id, selectedKey: key, quizRunId }),
      });
      setFeedback(fb);
      if (fb.isCorrect) setScore((s) => s + 1);
    } catch (e) {
      setSelected(null);
      setError(e instanceof Error ? e.message : "Vastust ei õnnestunud salvestada.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
  }

  if (error && !questions) return <ErrorBlock message={error} onRetry={load} />;
  if (!questions) return <LoadingBlock text="Laen küsimusi…" />;
  if (questions.length === 0) return <ErrorBlock message="Küsimusi pole veel lisatud." />;

  if (index >= questions.length) {
    const band = bands.find((b) => score >= b.min && score <= b.max);
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Test on läbi</h1>
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-3xl font-bold text-emerald-900">
            {score} / {questions.length}
          </p>
          {band && <p className="mt-3 text-slate-800">{band.text}</p>}
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button onClick={load}>Tee test uuesti</Button>
          <Link href="/progress">
            <Button variant="outline">Vaata edasijõudmist</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Tagasi õppima</Button>
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">
          Küsimus {index + 1} / {questions.length}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-xl font-semibold">{q.prompt}</h1>

      <div className="space-y-3">
        {q.options.map((o) => {
          const isSelected = selected === o.key;
          const showResult = feedback !== null;
          const isCorrectOption = showResult && o.key === feedback.correctOptionKey;
          const isWrongPick = showResult && isSelected && !feedback.isCorrect;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => answer(o.key)}
              disabled={showResult || busy}
              className={clsx(
                "w-full rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600",
                !showResult && "border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50",
                isCorrectOption && "border-emerald-600 bg-emerald-50",
                isWrongPick && "border-red-500 bg-red-50",
                showResult && !isCorrectOption && !isWrongPick && "border-slate-200 bg-white opacity-70",
              )}
            >
              {o.text}
            </button>
          );
        })}
      </div>

      {error && <ErrorBlock message={error} />}

      {feedback && (
        <Card className={feedback.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}>
          <p className="font-semibold">{feedback.coach}</p>
          <p className="mt-2 text-slate-700">{feedback.explanation}</p>
          <Button className="mt-4" onClick={next}>
            {index + 1 === questions.length ? "Vaata tulemust" : "Järgmine küsimus"}
          </Button>
        </Card>
      )}
    </div>
  );
}
