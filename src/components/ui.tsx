import * as React from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-emerald-700 text-white hover:bg-emerald-800",
        variant === "outline" && "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
        variant === "danger" && "border border-red-300 bg-white text-red-700 hover:bg-red-50",
        className,
      )}
      {...props}
    />
  );
}

export function LoadingBlock({ text = "Laen…" }: { text?: string }) {
  return <p className="py-10 text-center text-slate-500">{text}</p>;
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50 text-red-800">
      <p className="font-medium">Ups! {message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-3" onClick={onRetry}>
          Proovi uuesti
        </Button>
      )}
    </Card>
  );
}
