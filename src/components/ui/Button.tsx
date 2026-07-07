import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly icon?: ReactNode;
  readonly fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#1C69D4] text-white shadow-[0_14px_36px_rgba(28,105,212,0.34)] hover:bg-[#2878ec]",
  secondary: "border border-white/10 bg-white/8 text-white hover:bg-white/12",
  ghost: "bg-transparent text-white/80 hover:bg-white/8",
  danger: "bg-[#E40521] text-white shadow-[0_14px_36px_rgba(228,5,33,0.24)]"
};

export const Button = ({
  children,
  className,
  variant = "primary",
  icon,
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "tap inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold leading-none disabled:cursor-not-allowed disabled:opacity-50",
      variants[variant],
      fullWidth && "w-full",
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </button>
);
