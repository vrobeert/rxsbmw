import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BadgeTone = "blue" | "green" | "red" | "gold" | "muted" | "m";

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
  readonly className?: string;
}

const tones: Record<BadgeTone, string> = {
  blue: "border-[#1C69D4]/40 bg-[#1C69D4]/16 text-[#9cc4ff]",
  green: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
  red: "border-[#E40521]/35 bg-[#E40521]/14 text-red-100",
  gold: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  muted: "border-white/10 bg-white/7 text-white/70",
  m: "border-white/10 bg-[linear-gradient(90deg,rgba(0,160,222,.22),rgba(0,61,165,.22),rgba(228,5,33,.22))] text-white"
};

export const Badge = ({ children, tone = "muted", className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-normal",
      tones[tone],
      className
    )}
  >
    {children}
  </span>
);
