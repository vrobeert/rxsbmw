import type { ReactNode } from "react";
import { roNumber } from "../../lib/format";
import { Card } from "./Card";

interface StatTileProps {
  readonly label: string;
  readonly value: number;
  readonly suffix?: string;
  readonly icon?: ReactNode;
  readonly tone?: "blue" | "red" | "neutral";
}

const toneClasses = {
  blue: "from-[#1C69D4]/28 to-white/5",
  red: "from-[#E40521]/22 to-white/5",
  neutral: "from-white/10 to-white/5"
} as const;

export const StatTile = ({ label, value, suffix = "", icon, tone = "neutral" }: StatTileProps) => (
  <Card className={`overflow-hidden p-4 bg-gradient-to-br ${toneClasses[tone]}`}>
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-white/54">{label}</p>
      {icon ? <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white/80">{icon}</div> : null}
    </div>
    <div className="mt-4 flex items-end gap-1">
      <span className="text-3xl font-black tabular-nums text-white">{roNumber(value)}</span>
      {suffix ? <span className="pb-1 text-sm font-bold text-white/56">{suffix}</span> : null}
    </div>
  </Card>
);
