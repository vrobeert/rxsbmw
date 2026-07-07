import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly interactive?: boolean;
}

export const Card = ({ className, interactive = false, ...props }: CardProps) => (
  <div
    className={cn(
      "elevated rounded-2xl",
      interactive && "tap hover:border-white/18",
      className
    )}
    {...props}
  />
);
