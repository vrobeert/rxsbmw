import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import type { ClubEvent } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { roDateTime } from "../lib/format";

interface EventCardProps {
  readonly event: ClubEvent;
}

export const EventCard = ({ event }: EventCardProps) => (
  <Card interactive className="overflow-hidden">
    <img src={event.coverUrl} alt={event.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/evenimente/${event.id}`} className="text-lg font-black leading-tight hover:text-[#9cc4ff]">
            {event.title}
          </Link>
          <div className="mt-2 space-y-1 text-sm text-white/56">
            <p>
              <CalendarDays className="mr-2 inline" size={16} />
              {roDateTime(event.date)}
            </p>
            <p>
              <MapPin className="mr-2 inline" size={16} />
              {event.location}
            </p>
          </div>
        </div>
        <Badge tone={event.status === "upcoming" ? "blue" : "muted"}>
          {event.status === "upcoming" ? "Viitor" : "Trecut"}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white/68">
          {event.registeredCount} inscrisi · {event.priceRon} lei
        </p>
        <Link to={`/evenimente/${event.id}`}>
          <Button icon={<Ticket size={17} />}>Detalii</Button>
        </Link>
      </div>
    </div>
  </Card>
);
