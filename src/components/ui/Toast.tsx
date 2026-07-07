import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  readonly message: string;
  readonly visible: boolean;
}

export const Toast = ({ message, visible }: ToastProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-300/20 bg-emerald-400/14 p-3 text-sm font-bold text-emerald-50 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} />
        {message}
      </div>
    </div>
  );
};
