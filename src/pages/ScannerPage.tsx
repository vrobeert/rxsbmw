import { Camera, CheckCircle2, QrCode, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { useClubData } from "../lib/clubData";

interface BarcodeDetectorResult {
  readonly rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options: { readonly formats: readonly string[] }): BarcodeDetectorInstance;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export const ScannerPage = () => {
  const { isDemo, events } = useClubData();
  const nextEvent = events.find((event) => event.status === "upcoming") ?? events[0] ?? null;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [status, setStatus] = useState("Camera este oprita.");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(nextEvent?.checkedInCount ?? 0);

  useEffect(() => {
    setCheckedIn(nextEvent?.checkedInCount ?? 0);
  }, [nextEvent?.checkedInCount]);

  useEffect(
    () => () => {
      stopCamera();
    },
    []
  );

  const stopCamera = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const markCheckIn = (value: string) => {
    setLastScan(value);
    setCheckedIn((current) => current + 1);
    setStatus("Check-in validat.");
    navigator.vibrate?.(80);
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!window.BarcodeDetector) {
        setStatus("Camera pornita. Browserul nu are scanner QR nativ.");
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      setStatus("Scaneaza codul QR al participantului.");

      const tick = async () => {
        if (!videoRef.current) {
          return;
        }

        const results = await detector.detect(videoRef.current);
        const firstResult = results[0];
        if (firstResult) {
          markCheckIn(firstResult.rawValue);
          stopCamera();
          return;
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setStatus("Nu am putut porni camera. Verifica permisiunea browserului.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title="Scanare QR check-in"
        body="Functioneaza pe telefon pentru intrare rapida si pe laptop/PC daca staff-ul foloseste camera."
      />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-black lg:aspect-video">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-[28px] border-2 border-white/42 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            <div className="absolute left-4 top-4">
              <Badge tone={lastScan ? "green" : "blue"}>{lastScan ? "Validat" : "Ready"}</Badge>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <Button icon={<Camera size={18} />} onClick={startCamera}>
              Porneste camera
            </Button>
            {isDemo ? (
              <Button variant="secondary" icon={<CheckCircle2 size={18} />} onClick={() => markCheckIn("local-preview-ticket")}>
                Demo check-in
              </Button>
            ) : null}
            <Button variant="ghost" icon={<RotateCcw size={18} />} onClick={stopCamera}>
              Opreste
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <StatTile label="Prezenti acum" value={checkedIn} icon={<ShieldCheck size={19} />} tone="blue" />
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-[#9cc4ff]">
                <QrCode size={22} />
              </div>
              <div>
                <h2 className="font-black">Status scanare</h2>
                <p className="text-sm text-white/56">{status}</p>
              </div>
            </div>
            {lastScan ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-emerald-100/72">Ultimul QR</p>
                <p className="mt-2 break-all text-sm font-black text-emerald-50">{lastScan}</p>
              </div>
            ) : null}
          </Card>
        </div>
      </section>
    </div>
  );
};
