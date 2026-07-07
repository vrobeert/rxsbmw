import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const GlassPanel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass rounded-2xl", className)} {...props} />
);
