import type { ReactNode } from "react";

interface PageHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly body?: string;
  readonly action?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, body, action }: PageHeaderProps) => (
  <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      {eyebrow ? <p className="text-xs font-black uppercase tracking-normal text-[#9cc4ff]">{eyebrow}</p> : null}
      <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
      {body ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">{body}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </header>
);
