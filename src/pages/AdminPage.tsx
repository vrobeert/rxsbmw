import { CheckCircle2, Download, Search, ShieldCheck, Ticket, UsersRound, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import type { AdminMemberRow } from "../types";

type AdminPaymentStatus = "pending" | "cash" | "transfer" | "paid" | "refunded";

interface ParticipantRow {
  readonly id: string;
  readonly profileId: string;
  readonly name: string;
  readonly city: string;
  readonly paymentStatus: AdminPaymentStatus;
  readonly checkedInAt: string | null;
  readonly qrToken: string;
}

const paymentOptions: ReadonlyArray<{ readonly value: AdminPaymentStatus; readonly label: string }> = [
  { value: "pending", label: "Neplatit" },
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Transfer" },
  { value: "paid", label: "Platita" },
  { value: "refunded", label: "Refund" }
];

export const AdminPage = () => {
  const { loading, currentProfile, adminMembers, cars, events, profiles, refresh } = useClubData();
  const [query, setQuery] = useState("");
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const nextEvent = events.find((event) => event.status === "upcoming") ?? events[0] ?? null;
  const canUseStaffTools = currentProfile?.role === "admin" || currentProfile?.role === "staff";

  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  const filteredMembers = useMemo(
    () =>
      adminMembers.filter((member) =>
        `${member.name} ${member.city} ${member.role} ${member.level}`.toLowerCase().includes(query.toLowerCase())
      ),
    [adminMembers, query]
  );

  useEffect(() => {
    if (!canUseStaffTools || !nextEvent || !supabase) {
      setParticipants([]);
      setParticipantsLoading(false);
      return undefined;
    }

    let active = true;
    setParticipantsLoading(true);
    setParticipantsError(null);

    void (async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id,profile_id,payment_status,checked_in_at,qr_token,created_at")
        .eq("event_id", nextEvent.id)
        .order("created_at", { ascending: false });

        if (!active) {
          return;
        }

        if (error) {
          setParticipantsError(error.message);
          setParticipants([]);
          setParticipantsLoading(false);
          return;
        }

        setParticipants(
          (data ?? []).map((registration) => {
            const profile = profileById.get(registration.profile_id);

            return {
              id: registration.id,
              profileId: registration.profile_id,
              name: profile?.fullName ?? "Membru BMW",
              city: profile?.city ?? "Romania",
              paymentStatus: registration.payment_status,
              checkedInAt: registration.checked_in_at,
              qrToken: registration.qr_token
            };
          })
        );

      if (active) {
        setParticipantsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [canUseStaffTools, nextEvent, profileById]);

  if (loading) {
    return <SkeletonLoader rows={5} />;
  }

  if (!canUseStaffTools) {
    return (
      <EmptyState
        icon={<ShieldCheck size={24} />}
        title="Acces staff necesar"
        body="Panoul admin este disponibil doar pentru conturi cu rol staff sau admin in Supabase."
        action={
          <Link to="/login">
            <Button>Intra in cont</Button>
          </Link>
        }
      />
    );
  }

  const exportCsv = () => {
    const header = "name,city,role,level,membership_paid";
    const rows = adminMembers.map((member) =>
      [member.name, member.city, member.role, member.level, String(member.membershipPaid)].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bavarianhub-members.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const updatePaymentStatus = async (registrationId: string, paymentStatus: AdminPaymentStatus) => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.from("event_registrations").update({ payment_status: paymentStatus }).eq("id", registrationId);

    if (error) {
      setParticipantsError(error.message);
      return;
    }

    setParticipants((current) =>
      current.map((participant) => (participant.id === registrationId ? { ...participant, paymentStatus } : participant))
    );
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin mobile + desktop"
        title="Staff dashboard"
        body="Pe telefon ramane rapid pentru interventii, iar pe calculator foloseste spatiul complet pentru cautare, tabele si exporturi."
        action={
          <Button icon={<Download size={18} />} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Membri total" value={adminMembers.length} icon={<UsersRound size={19} />} tone="blue" />
        <StatTile label="Cotizatii active" value={adminMembers.filter((member) => member.membershipPaid).length} icon={<CheckCircle2 size={19} />} />
        <StatTile label="Inscrieri event" value={nextEvent?.registeredCount ?? 0} icon={<Ticket size={19} />} tone="red" />
        <StatTile label="Masini moderate" value={cars.filter((car) => car.approved).length} icon={<Wrench size={19} />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Management membri</h2>
              <p className="mt-1 text-sm text-white/52">Cautare, roluri, niveluri si cotizatii.</p>
            </div>
            <label className="relative block sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/42" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cauta membru"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/6 pl-10 pr-3 text-sm font-semibold text-white outline-none placeholder:text-white/34"
              />
            </label>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white/7 text-xs uppercase tracking-normal text-white/48">
                <tr>
                  <th className="px-4 py-3">Nume</th>
                  <th className="px-4 py-3">Oras</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Nivel</th>
                  <th className="px-4 py-3">Cotizatie</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 lg:hidden">
            {filteredMembers.map((member) => (
              <div key={member.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{member.name}</p>
                    <p className="text-sm text-white/52">{member.city}</p>
                  </div>
                  <Badge tone={member.membershipPaid ? "green" : "red"}>
                    {member.membershipPaid ? "Activ" : "Restant"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge tone="blue">{member.role}</Badge>
                  <Badge tone="m">{member.level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-xl font-black">Eveniment curent</h2>
            <p className="mt-1 text-sm text-white/52">{nextEvent?.title ?? "Niciun eveniment publicat"}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <LiveMetric label="Inscrisi" value={nextEvent?.registeredCount ?? 0} />
              <LiveMetric label="Check-in" value={nextEvent?.checkedInCount ?? 0} />
            </div>
            <div className="mt-4 grid gap-3">
              <Link to={nextEvent ? `/evenimente/${nextEvent.id}` : "/evenimente"}>
                <Button fullWidth icon={<Ticket size={18} />}>
                  Vezi eveniment
                </Button>
              </Link>
              <Button
                fullWidth
                variant="secondary"
                icon={<ShieldCheck size={18} />}
                onClick={() => document.getElementById("participants")?.scrollIntoView({ behavior: "smooth" })}
              >
                Lista participanti
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-black">Moderare continut</h2>
            <div className="mt-4 space-y-3">
              {cars.slice(0, 3).map((car) => (
                <div key={car.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
                  <img src={car.coverUrl} alt={car.model} className="h-14 w-20 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{car.model}</p>
                    <p className="text-xs text-white/50">{car.ownerName}</p>
                  </div>
                  <Badge tone={car.approved ? "green" : "red"}>{car.approved ? "OK" : "Ascuns"}</Badge>
                </div>
              ))}
              {cars.length === 0 ? <p className="text-sm text-white/56">Nu exista masini de moderat.</p> : null}
            </div>
          </Card>
        </div>
      </section>

      <Card id="participants" className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Participanti eveniment</h2>
            <p className="mt-1 text-sm text-white/52">{nextEvent?.title ?? "Alege sau publica un eveniment."}</p>
          </div>
          <Badge tone="blue">{participants.length} inscrisi</Badge>
        </div>

        {participantsError ? (
          <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">{participantsError}</p>
        ) : null}

        {participantsLoading ? (
          <div className="mt-5">
            <SkeletonLoader rows={3} />
          </div>
        ) : participants.length > 0 ? (
          <>
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/7 text-xs uppercase tracking-normal text-white/48">
                  <tr>
                    <th className="px-4 py-3">Membru</th>
                    <th className="px-4 py-3">Oras</th>
                    <th className="px-4 py-3">Plata</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">QR</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <ParticipantRowView key={participant.id} participant={participant} onPaymentChange={updatePaymentStatus} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-3 lg:hidden">
              {participants.map((participant) => (
                <div key={participant.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{participant.name}</p>
                      <p className="text-sm text-white/52">{participant.city}</p>
                    </div>
                    <Badge tone={participant.checkedInAt ? "green" : "muted"}>{participant.checkedInAt ? "Prezent" : "Nevalidat"}</Badge>
                  </div>
                  <label className="mt-3 block">
                    <span className="text-xs font-bold uppercase tracking-normal text-white/46">Status plata</span>
                    <PaymentSelect participant={participant} onPaymentChange={updatePaymentStatus} />
                  </label>
                  <p className="mt-3 break-all text-xs text-white/42">{participant.qrToken}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/56">
            Nu exista inscrieri pentru evenimentul curent.
          </p>
        )}
      </Card>
    </div>
  );
};

const MemberRow = ({ member }: { readonly member: AdminMemberRow }) => (
  <tr className="border-t border-white/8">
    <td className="px-4 py-4 font-black">{member.name}</td>
    <td className="px-4 py-4 text-white/62">{member.city}</td>
    <td className="px-4 py-4">
      <Badge tone={member.role === "admin" ? "m" : "blue"}>{member.role}</Badge>
    </td>
    <td className="px-4 py-4">
      <Badge tone={member.level === "Elite" ? "m" : "muted"}>{member.level}</Badge>
    </td>
    <td className="px-4 py-4">
      <Badge tone={member.membershipPaid ? "green" : "red"}>{member.membershipPaid ? "Platita" : "Neplatita"}</Badge>
    </td>
  </tr>
);

const LiveMetric = ({ label, value }: { readonly label: string; readonly value: number }) => (
  <div className="rounded-2xl bg-white/6 p-4">
    <p className="text-xs font-bold uppercase tracking-normal text-white/46">{label}</p>
    <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
  </div>
);

const ParticipantRowView = ({
  participant,
  onPaymentChange
}: {
  readonly participant: ParticipantRow;
  readonly onPaymentChange: (registrationId: string, paymentStatus: AdminPaymentStatus) => Promise<void>;
}) => (
  <tr className="border-t border-white/8">
    <td className="px-4 py-4 font-black">{participant.name}</td>
    <td className="px-4 py-4 text-white/62">{participant.city}</td>
    <td className="px-4 py-4">
      <PaymentSelect participant={participant} onPaymentChange={onPaymentChange} />
    </td>
    <td className="px-4 py-4">
      <Badge tone={participant.checkedInAt ? "green" : "muted"}>{participant.checkedInAt ? "Prezent" : "Nevalidat"}</Badge>
    </td>
    <td className="max-w-[220px] truncate px-4 py-4 font-mono text-xs text-white/50">{participant.qrToken}</td>
  </tr>
);

const PaymentSelect = ({
  participant,
  onPaymentChange
}: {
  readonly participant: ParticipantRow;
  readonly onPaymentChange: (registrationId: string, paymentStatus: AdminPaymentStatus) => Promise<void>;
}) => (
  <select
    value={participant.paymentStatus}
    onChange={(event) => void onPaymentChange(participant.id, event.target.value as AdminPaymentStatus)}
    className="h-10 rounded-xl border border-white/10 bg-[#111116] px-3 text-sm font-bold text-white outline-none"
  >
    {paymentOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
