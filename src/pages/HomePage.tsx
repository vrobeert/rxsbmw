import { ArrowRight, CalendarClock, CarFront, Megaphone, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { announcements, cars, events } from "../data/mock";
import { EventCard } from "../features/EventCard";
import { PwaInstallBanner } from "../features/PwaInstallBanner";
import { daysUntil, roDateTime } from "../lib/format";

export const HomePage = () => {
  const fallbackEvent = events[0];

  if (!fallbackEvent) {
    return null;
  }

  const nextEvent = events.find((event) => event.status === "upcoming") ?? fallbackEvent;
  const featuredCars = cars.slice(0, 3);

  return (
    <div className="space-y-7">
      <PwaInstallBanner />
      <PageHeader
        eyebrow="BavarianHub"
        title="Clubul tau BMW, pregatit pentru drum."
        body="Feed, garaj, evenimente si check-in pentru staff intr-o platforma rapida, gandita intai pentru telefon si extinsa corect pe desktop."
        action={
          <Link to="/admin" className="hidden lg:block">
            <Button icon={<ShieldCheck size={18} />}>Staff dashboard</Button>
          </Link>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden">
          <div className="relative min-h-[360px]">
            <img src={nextEvent.coverUrl} alt={nextEvent.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/38 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <Badge tone="m">Urmatorul eveniment</Badge>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white">{nextEvent.title}</h2>
              <p className="mt-2 text-sm font-semibold text-white/72">{roDateTime(nextEvent.date)}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/56">Countdown</p>
                  <p className="text-2xl font-black tabular-nums">{daysUntil(nextEvent.date)} zile</p>
                </div>
                <Link to={`/evenimente/${nextEvent.id}`}>
                  <Button icon={<ArrowRight size={18} />}>Vezi detalii</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatTile label="Membri" value={156} icon={<UsersRound size={19} />} tone="blue" />
          <StatTile label="Masini in garaj" value={48} icon={<CarFront size={19} />} />
          <StatTile label="Check-in live" value={nextEvent.checkedInCount} icon={<CalendarClock size={19} />} tone="red" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Garaj nou</h2>
          <Link to="/garaj" className="text-sm font-bold text-[#9cc4ff]">
            Vezi toate
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredCars.map((car) => (
            <Card key={car.id} interactive className="overflow-hidden">
              <Link to={`/garaj/${car.id}`}>
                <img src={car.coverUrl} alt={car.model} className="aspect-[16/11] w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-base font-black">{car.model}</p>
                  <p className="mt-1 text-sm text-white/52">
                    {car.ownerName} · {car.powerHp} CP
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <h2 className="mb-4 text-xl font-black">Anunturi club</h2>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8 text-white/70">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <p className="font-black">{announcement.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/56">{announcement.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <EventCard event={nextEvent} />
      </section>
    </div>
  );
};
