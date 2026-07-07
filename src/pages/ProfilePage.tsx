import { Bell, CarFront, CreditCard, LogOut, Mail, Settings, ShieldCheck, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { PageHeader } from "../components/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { cars, demoProfile, events, registrations } from "../data/mock";
import { MemberCard } from "../features/MemberCard";
import { roDate, roDateTime } from "../lib/format";

export const ProfilePage = () => {
  const myCars = cars.filter((car) => car.ownerId === demoProfile.id);
  const myTickets = registrations.filter((registration) => registration.profileId === demoProfile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profil membru"
        title="Card digital si setari"
        body="Profilul centralizeaza datele de membru, cotizatia, masinile si biletele active."
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <MemberCard profile={demoProfile} />

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar src={demoProfile.avatarUrl} name={demoProfile.fullName} size="lg" />
            <div>
              <h2 className="text-xl font-black">{demoProfile.fullName}</h2>
              <p className="text-sm text-white/52">{demoProfile.bio}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <InfoRow icon={<ShieldCheck size={18} />} label="Rol" value={demoProfile.role} />
            <InfoRow icon={<CreditCard size={18} />} label="Cotizatie" value={demoProfile.membershipPaid ? "Platita" : "Neplatita"} />
            <InfoRow icon={<Bell size={18} />} label="Expira" value={roDate(demoProfile.membershipExpiresAt)} />
            <InfoRow icon={<Mail size={18} />} label="Email" value="demo@bavarianhub.ro" />
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Masinile mele</h2>
            <Badge tone="blue">{myCars.length}</Badge>
          </div>
          <div className="space-y-3">
            {myCars.map((car) => (
              <Link key={car.id} to={`/garaj/${car.id}`} className="tap flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
                <img src={car.coverUrl} alt={car.model} className="h-16 w-20 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <p className="truncate font-black">{car.model}</p>
                  <p className="text-sm text-white/52">
                    {car.engine} · {car.powerHp} CP
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Bilete active</h2>
            <Ticket className="text-[#9cc4ff]" size={20} />
          </div>
          <div className="space-y-3">
            {myTickets.map((ticket) => {
              const event = events.find((item) => item.id === ticket.eventId);

              if (!event) {
                return null;
              }

              return (
                <div key={ticket.id} className="flex gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div className="rounded-xl bg-white p-2">
                    <QRCode value={`bavarianhub:ticket:${ticket.qrToken}`} size={70} />
                  </div>
                  <div>
                    <Badge tone="green">Valid</Badge>
                    <p className="mt-2 font-black">{event.title}</p>
                    <p className="mt-1 text-sm text-white/52">{roDateTime(event.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <h2 className="text-xl font-black">Setari</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Button variant="secondary" icon={<Settings size={18} />}>
            Editeaza profil
          </Button>
          <Button variant="secondary" icon={<CarFront size={18} />}>
            Adauga masina
          </Button>
          <Button variant="ghost" icon={<LogOut size={18} />}>
            Delogare
          </Button>
        </div>
      </Card>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { readonly icon: ReactNode; readonly label: string; readonly value: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 p-3">
    <div className="flex items-center gap-3 text-white/56">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <span className="text-sm font-black capitalize text-white">{value}</span>
  </div>
);
