import { CalendarDays, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { EventCard } from "../features/EventCard";
import { useClubData } from "../lib/clubData";
import { roDateTime } from "../lib/format";

type EventFilter = "Viitoare" | "Trecute";

const filters: readonly EventFilter[] = ["Viitoare", "Trecute"];

export const EventsPage = () => {
  const { loading, events, registrations } = useClubData();
  const [filter, setFilter] = useState<EventFilter>("Viitoare");

  const visibleEvents = useMemo(
    () => events.filter((event) => (filter === "Viitoare" ? event.status === "upcoming" : event.status === "past")),
    [events, filter]
  );

  if (loading) {
    return <SkeletonLoader rows={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evenimente"
        title="Inscrieri, bilete si check-in"
        body="Membrii isi vad biletele, iar staff-ul poate valida rapid participantii prin QR."
        action={
          <Link to="/scan" className="hidden lg:block">
            <Button icon={<Ticket size={18} />}>Deschide scanarea</Button>
          </Link>
        }
      />

      <SegmentedControl options={filters} value={filter} onChange={setFilter} />

      {registrations.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xl font-black">Biletele mele</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {registrations.map((registration) => {
              const event = events.find((item) => item.id === registration.eventId);

              if (!event) {
                return null;
              }

              return (
                <Card key={registration.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white p-2">
                      <QRCode value={`bavarianhub:ticket:${registration.qrToken}`} size={86} />
                    </div>
                    <div className="min-w-0">
                      <Badge tone="green">Confirmat</Badge>
                      <p className="mt-3 text-lg font-black">{event.title}</p>
                      <p className="mt-1 text-sm text-white/56">{roDateTime(event.date)}</p>
                      <p className="mt-1 text-sm font-bold text-white/70">Categoria {registration.category}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {visibleEvents.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      ) : (
        <EmptyState icon={<CalendarDays size={24} />} title="Nu exista evenimente" body="Evenimentele publicate in Supabase vor aparea aici." />
      )}
    </div>
  );
};
