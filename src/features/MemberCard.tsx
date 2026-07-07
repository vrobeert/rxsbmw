import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import type { PointerEvent } from "react";
import type { Profile } from "../types";
import { brand } from "../brand";
import { Badge } from "../components/ui/Badge";
import { roDate } from "../lib/format";

interface MemberCardProps {
  readonly profile: Profile;
}

export const MemberCard = ({ profile }: MemberCardProps) => {
  const [transform, setTransform] = useState("perspective(900px) rotateX(0deg) rotateY(0deg)");

  useEffect(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      const beta = Math.max(-18, Math.min(18, event.beta ?? 0));
      const gamma = Math.max(-18, Math.min(18, event.gamma ?? 0));
      setTransform(`perspective(900px) rotateX(${beta / 5}deg) rotateY(${gamma / 5}deg)`);
    };

    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`);
  };

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#101014] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48)] transition-transform duration-200"
      style={{ transform }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)")}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,160,222,.35),rgba(0,61,165,.22),rgba(228,5,33,.18))]" />
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/14 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-white/58">{brand.name}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{profile.fullName}</h2>
            <p className="mt-1 text-sm font-semibold text-white/70">{profile.city}</p>
          </div>
          <Badge tone="m">{profile.level}</Badge>
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-white/48">Member ID</p>
            <p className="mt-1 text-xl font-black tabular-nums">{profile.memberCode}</p>
            <p className="mt-4 text-xs text-white/58">Activ pana la {roDate(profile.membershipExpiresAt)}</p>
          </div>
          <div className="rounded-2xl bg-white p-2">
            <QRCode value={`bavarianhub:member:${profile.memberCode}`} size={94} />
          </div>
        </div>
      </div>
    </div>
  );
};
