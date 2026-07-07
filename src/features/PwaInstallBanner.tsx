import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import type { BeforeInstallPromptEvent } from "../lib/pwa";
import { Button } from "../components/ui/Button";

export const PwaInstallBanner = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("bh-install-dismissed") === "true");

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!promptEvent || dismissed) {
    return null;
  }

  const install = async () => {
    await promptEvent.prompt();
    setPromptEvent(null);
  };

  const close = () => {
    localStorage.setItem("bh-install-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-30 mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#121216]/94 p-3 shadow-2xl backdrop-blur-xl lg:bottom-5 lg:left-auto lg:right-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1C69D4] text-white">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">Adauga pe ecranul principal</p>
          <p className="text-xs leading-5 text-white/56">Deschide platforma ca o aplicatie instalata.</p>
        </div>
        <Button variant="primary" onClick={install}>
          Instaleaza
        </Button>
        <button aria-label="Inchide banner" className="tap rounded-xl p-2 text-white/54" type="button" onClick={close}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
