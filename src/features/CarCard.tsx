import { Heart, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Car } from "../types";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { roNumber } from "../lib/format";

interface CarCardProps {
  readonly car: Car;
}

export const CarCard = ({ car }: CarCardProps) => {
  const lastTapRef = useRef(0);
  const [liked, setLiked] = useState(false);
  const likes = car.likes + (liked ? 1 : 0);

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      setLiked(true);
    }
    lastTapRef.current = now;
  };

  return (
    <Card interactive className="overflow-hidden">
      <button className="block w-full text-left" type="button" onClick={handleImageTap}>
        <img src={car.coverUrl} alt={car.model} className="aspect-[16/10] w-full object-cover" loading="lazy" />
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/garaj/${car.id}`} className="text-lg font-black leading-tight text-white hover:text-[#9cc4ff]">
              {car.model}
            </Link>
            <p className="mt-1 text-sm text-white/52">
              {car.ownerName} · {car.city}
            </p>
          </div>
          <Badge tone={car.generation.startsWith("E") ? "gold" : "blue"}>{car.generation}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-white/6 p-3">
            <p className="text-white/44">Motor</p>
            <p className="mt-1 font-bold">{car.engine}</p>
          </div>
          <div className="rounded-xl bg-white/6 p-3">
            <p className="text-white/44">Putere</p>
            <p className="mt-1 font-bold tabular-nums">{car.powerHp} CP</p>
          </div>
          <div className="rounded-xl bg-white/6 p-3">
            <p className="text-white/44">An</p>
            <p className="mt-1 font-bold tabular-nums">{car.year}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm font-bold text-white/66">
          <span className={liked ? "text-red-200" : ""}>
            <Heart className="mr-1 inline" size={17} fill={liked ? "currentColor" : "none"} /> {roNumber(likes)}
          </span>
          <span>
            <MessageCircle className="mr-1 inline" size={17} /> {roNumber(car.comments)}
          </span>
        </div>
      </div>
    </Card>
  );
};
