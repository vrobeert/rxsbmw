import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import type { LucideProps } from "lucide-react";
import { cn } from "../../lib/cn";

export interface TabItem {
  readonly label: string;
  readonly to: string;
  readonly icon: ComponentType<LucideProps>;
}

interface TabBarProps {
  readonly items: readonly TabItem[];
}

export const TabBar = ({ items }: TabBarProps) => (
  <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0a0a0c]/88 px-3 pt-2 shadow-[0_-18px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid max-w-lg grid-flow-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "tap flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-bold text-white/48",
                isActive && "bg-white/10 text-white"
              )
            }
          >
            <Icon size={20} strokeWidth={2.3} />
            <span className="mt-1 max-w-full truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  </nav>
);
