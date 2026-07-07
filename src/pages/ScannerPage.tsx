import { Camera, CheckCircle2, QrCode, RotateCcw, Search, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { StatTile } from "../components/ui/StatTile";
import { useClubData } from "../lib/clubData";
import { supabase } from "../lib/supabase";

interface BarcodeDetectorResult {
  readonly rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options: { readonly formats: readonly string[] }): BarcodeDetectorInstance;
}

type ScanTone = "ready" | "valid" | "error";

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export const ScannerPage = () => {
  const { loading, currentProfile, events, refresh } = useClubData();
  const nextEvent = events.find((event) => event.status === "upcoming") ?? events[0] ?? null;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [status, setStatus] = useState("Camera este oprita.");
  const [scanTone, setScanTone] = useState<ScanTone>("ready");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [processing, setProcessing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(nextEvent?.checkedInCount ?? 0);
  const canUseStaffTools = currentProfile?.role === "admin" || currentProfile?.role === "staff";

  function stopCamera() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    setCheckedIn(nextEvent?.checkedInCount ?? 0);
  }, [nextEvent?.checkedInCount]);

  useEffect(
    () => () => {
      stopCamera();
    },
    []
  );

  if (loading) {
    return <SkeletonLoader rows={5} />;
  }

  if (!canUseStaffTools) {
    return (
      <EmptyState
        icon={<ShieldCheck size={24} />}
        title="Acces staff necesar"
        body="Scanarea QR poate fi folosita doar de staff sau admin."
        action={
          <Link to="/login">
            <Button>Intra in cont</Button>
          </Link>
        }
      />
    );
  }

  const processScan = async (value: string) => {
    if (!supabase || !currentProfile || processing) {
      return;
    }

    const token = extractTicketToken(value);
    setLastScan(value);
    setProcessing(true);

    if (!token) {
      setScanTone("error");
      setStatus("QR invalid. Nu am gasit tokenul biletului.");
      navigator.vibrate?.([60, 50, 60]);
      setProcessing(false);
      return;
    }

    const { data: ticket, error } = await supabase
      .from("event_registrations")
      .select("id,event_id,profile_id,payment_status,checked_in_at,qr_token")
      .eq("qr_token", token)
      .maybeSingle();

    if (error || !ticket) {
      setScanTone("error");
      setStatus(error?.message ?? "Bilet invalid sau inexistent.");
      navigator.vibrate?.([60, 50, 60]);
      setProcessing(false);
      return;
    }

    if (ticket.checked_in_at) {
      setScanTone("error");
      setStatus("Bilet deja scanat.");
      navigator.vibrate?.([60, 50, 60]);
      setProcessing(false);
      return;
    }

    if (!isPaid(ticket.payment_status)) {
      setScanTone("error");
      setStatus("Bilet neplatit. Marcheaza plata in Admin inainte de check-in.");
      navigator.vibrate?.([60, 50, 60]);
      setProcessing(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: new Date().toISOString(),
        checked_in_by: currentProfile.id
      })
      .eq("id", ticket.id);

    if (updateError) {
      setScanTone("error");
      setStatus(updateError.message);
      navigator.vibrate?.([60, 50, 60]);
      setProcessing(false);
      return;
    }

    setScanTone("valid");
    setCheckedIn((current) => current + 1);
    setStatus("Check-in validat in Supabase.");
    navigator.vibrate?.(90);
    await refresh();
    setProcessing(false);
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
        setStatus("Camera pornita. Browserul nu are scanner QR nativ; foloseste verificarea manuala.");
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      setScanTone("ready");
      setStatus("Scaneaza codul QR al participantului.");

      const tick = async () => {
        if (!videoRef.current) {
          return;
        }

        const results = await detector.detect(videoRef.current);
        const firstResult = results[0];
        if (firstResult) {
          stopCamera();
          void processScan(firstResult.rawValue);
          return;
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setScanTone("error");
      setStatus("Nu am putut porni camera. Verifica permisiunea browserului.");
    }
  };

  const statusIcon = scanTone === "valid" ? <CheckCircle2 size={22} /> : scanTone === "error" ? <XCircle size={22} /> : <QrCode size={22} />;
  const badgeTone: "green" | "red" | "blue" = scanTone === "valid" ? "green" : scanTone === "error" ? "red" : "blue";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title="Scanare QR check-in"
        body="Valideaza biletele in Supabase, respinge automat QR-urile invalide, neplatite sau deja scanate."
      />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-black lg:aspect-video">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-[28px] border-2 border-white/42 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            <div className="absolute left-4 top-4">
              <Badge tone={badgeTone}>{scanTone === "valid" ? "Validat" : scanTone === "error" ? "Respins" : "Ready"}</Badge>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Button icon={<Camera size={18} />} onClick={startCamera} disabled={processing}>
              Porneste camera
            </Button>
            <Button variant="ghost" icon={<RotateCcw size={18} />} onClick={stopCamera}>
              Opreste
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <StatTile label="Prezenti acum" value={checkedIn} icon={<ShieldCheck size={19} />} tone="blue" />

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-[#9cc4ff]">{statusIcon}</div>
              <div>
                <h2 className="font-black">Status scanare</h2>
                <p className="text-sm text-white/56">{status}</p>
              </div>
            </div>
            {lastScan ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-white/46">Ultimul QR</p>
                <p className="mt-2 break-all text-sm font-black text-white">{lastScan}</p>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-black">Verificare manuala</h2>
            <p className="mt-1 text-sm leading-6 text-white/52">Lipeste tokenul sau continutul QR-ului daca scanarea camerei nu merge.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="bavarianhub:ticket:..."
                className="h-12 rounded-2xl border border-white/10 bg-white/6 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/34"
              />
              <Button icon={<Search size={18} />} onClick={() => void processScan(manualToken)} disabled={processing || !manualToken.trim()}>
                Verifica
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

const extractTicketToken = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);

  return match?.[0] ?? null;
};

const isPaid = (status: "pending" | "cash" | "transfer" | "paid" | "refunded") =>
  status === "cash" || status === "transfer" || status === "paid";
