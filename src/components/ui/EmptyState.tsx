import type { ReactNode } from "react";

interface EmptyStateProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
  readonly action?: ReactNode;
}

export const EmptyState = ({ icon, title, body, action }: EmptyStateProps) => (
  <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-white/12 bg-white/5 p-8 text-center">
    <div>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/8 text-white/70">{icon}</div>
      <h2 className="mt-5 text-lg font-black text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/56">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  </div>
);
