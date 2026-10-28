import { Gamepad2, MessageSquare, ShieldCheck, ShoppingCart, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "message-square": MessageSquare,
  "shopping-cart": ShoppingCart,
  "gamepad-2": Gamepad2,
  "shield-check": ShieldCheck,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? ShieldCheck;
  return <Icon className={className} aria-hidden="true" />;
}
