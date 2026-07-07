import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface BottomSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
}

export const BottomSheet = ({ open, title, children, onClose }: BottomSheetProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/58 p-3 backdrop-blur-sm lg:items-center lg:justify-center">
      <section className="glass safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-5 shadow-2xl lg:max-w-2xl lg:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/18 lg:hidden" />
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-white">{title}</h2>
          <Button aria-label="Inchide" variant="ghost" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
};
