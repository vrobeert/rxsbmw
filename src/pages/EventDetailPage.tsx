import { ArrowLeft, CheckCircle2, MapPin, QrCode, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { Toast } from "../components/ui/Toast";
import { useClubData } from "../lib/clubData";
import { supabase } from "../lib/supabase";
import { roDateTime } from "../lib/format";

export const EventDetailPage = () => {
  const { eventId } = useParams();
  const { loading, isDemo, currentProfile, events, sponsors, refresh } = useClubData();
  const event = events.find((item) => item.id === eventId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState<string | null>(null);
  const ticketToken = useMemo(() => `demo-${eventId ?? "event"}-${category}`, [category, eventId]);

  if (loading) {
    return <SkeletonLoader rows={4} />;
  }

  if (!event) {
    return (
      <EmptyState
        icon={<Ticket size={24} />}
        title="Evenimentul nu a fost gasit"
        body="Linkul pare sa nu mai fie valid sau evenimentul nu este publicat."
        action={
          <Link to="/evenimente">
            <Button>Inapoi la evenimente</Button>
          </Link>
        }
      />
    );
  }

  const eventSponsors = sponsors.filter((sponsor) => event.sponsorIds.includes(sponsor.id));
  const categories = event.categories.length > 0 ? event.categories : ["General"];

  const confirm = async () => {
    if (isDemo) {
      setMessage("Inscriere demo confirmata local.");
      setSheetOpen(false);
      return;
    }

    if (!currentProfile || !supabase) {
      setMessage("Trebuie sa fii autentificat pentru inscriere.");
      setSheetOpen(false);
      return;
    }

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      profile_id: currentProfile.id,
      payment_status: "pending"
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await refresh();
    setMessage("Inscriere trimisa. Biletul apare in profil dupa refresh.");
    setSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <Toast message={message ?? ""} visible={Boolean(message)} />

      <Link to="/evenimente" className="inline-flex items-center gap-2 text-sm font-bold text-white/58 hover:text-white">
        <ArrowLeft size={17} />
        Inapoi
      </Link>

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#121216]">
        <img src={event.coverUrl} alt={event.title} className="h-[420px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/38 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <Badge tone={event.status === "upcoming" ? "blue" : "muted"}>
            {event.status === "upcoming" ? "Eveniment viitor" : "Eveniment trecut"}
          </Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight">{event.title}</h1>
          <p className="mt-3 text-sm font-semibold text-white/72">{roDateTime(event.date)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button icon={<Ticket size={18} />} onClick={() => setSheetOpen(true)} disabled={event.status === "past"}>
              Inscrie-te
            </Button>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" icon={<MapPin size={18} />}>
                Harta
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <PageHeader title="Program si detalii" body={event.description} />

          <Card className="p-5">
            {event.schedule.length > 0 ? (
              <div className="space-y-4">
                {event.schedule.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="grid grid-cols-[72px_1fr] gap-4">
                    <p className="font-black tabular-nums text-[#9cc4ff]">{item.time}</p>
                    <div className="border-l border-white/10 pb-4 pl-4 last:pb-0">
                      <p className="font-bold text-white">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/56">Programul nu este publicat inca.</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-xl font-black">Live check-in</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Inscrisi" value={event.registeredCount} />
              <Metric label="Prezenti" value={event.checkedInCount} />
            </div>
            <Link to="/scan" className="mt-4 block">
              <Button fullWidth icon={<QrCode size={18} />}>
                Scan QR
              </Button>
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-black">Sponsori</h2>
            <div className="mt-4 grid gap-3">
              {eventSponsors.length > 0 ? (
                eventSponsors.map((sponsor) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="tap flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-black text-[#0a0a0c]">
                      {sponsor.logoText}
                    </span>
                    <span className="font-bold">{sponsor.name}</span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-white/56">Nu exista sponsori publicati pentru acest eveniment.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <BottomSheet open={sheetOpen} title="Inscriere eveniment" onClose={() => setSheetOpen(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-white/70">Categoria masinii</span>
            <select
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#0f0f14] px-3 text-white outline-none"
              value={category}
              onChange={(eventChange) => setCategory(eventChange.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-200" size={20} />
              <p className="text-sm leading-6 text-white/68">
                Plata ramane marcata manual de admin in faza 1. QR-ul final este generat de Supabase la inscriere.
              </p>
            </div>
            {isDemo ? (
              <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3">
                <QRCode value={`bavarianhub:ticket:${ticketToken}`} size={120} />
              </div>
            ) : null}
          </div>
          <Button fullWidth icon={<Ticket size={18} />} onClick={confirm}>
            Confirma inscrierea
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

const Metric = ({ label, value }: { readonly label: string; readonly value: number }) => (
  <div className="rounded-2xl bg-white/6 p-4">
    <p className="text-xs font-bold uppercase tracking-normal text-white/46">{label}</p>
    <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
  </div>
);
