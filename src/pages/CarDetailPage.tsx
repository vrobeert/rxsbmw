import { ArrowLeft, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { useClubData } from "../lib/clubData";

export const CarDetailPage = () => {
  const { carId } = useParams();
  const { loading, cars } = useClubData();
  const car = cars.find((item) => item.id === carId);

  if (loading) {
    return <SkeletonLoader rows={4} />;
  }

  if (!car) {
    return (
      <EmptyState
        icon={<CarIcon />}
        title="Masina nu a fost gasita"
        body="Linkul pare sa nu mai fie valid."
        action={
          <Link to="/garaj">
            <Button>Inapoi la garaj</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/garaj" className="inline-flex items-center gap-2 text-sm font-bold text-white/58 hover:text-white">
        <ArrowLeft size={17} />
        Inapoi
      </Link>

      <PageHeader
        eyebrow={`${car.generation} · ${car.city}`}
        title={car.model}
        body={`${car.ownerName} · ${car.engine} · ${car.powerHp} CP`}
      />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <Card className="overflow-hidden">
          <div className="flex snap-x gap-2 overflow-x-auto p-2 hide-scrollbar">
            {car.photos.map((photo, index) => (
              <img
                key={photo}
                src={photo}
                alt={`${car.model} foto ${index + 1}`}
                className="aspect-[16/10] w-full min-w-full snap-center rounded-xl object-cover"
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{car.generation}</Badge>
            <Badge tone={car.approved ? "green" : "red"}>
              {car.approved ? "Aprobat" : "Ascuns"}
            </Badge>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Spec label="Motor" value={car.engine} />
            <Spec label="Putere" value={`${car.powerHp} CP`} />
            <Spec label="An" value={`${car.year}`} />
            <Spec label="Culoare" value={car.color} />
          </dl>
          <div className="mt-5 flex gap-4 text-sm font-bold text-white/68">
            <span>
              <Heart className="mr-1 inline" size={17} /> {car.likes}
            </span>
            <span>
              <MessageCircle className="mr-1 inline" size={17} /> {car.comments}
            </span>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Modificari</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {car.mods.map((mod) => (
            <Card key={`${mod.category}-${mod.description}`} className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8 text-[#9cc4ff]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-black">{mod.category}</p>
                  <p className="mt-1 text-sm leading-6 text-white/56">{mod.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

const Spec = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="rounded-xl bg-white/6 p-3">
    <dt className="text-white/42">{label}</dt>
    <dd className="mt-1 font-black text-white">{value}</dd>
  </div>
);

const CarIcon = () => <span className="text-2xl">BMW</span>;
