import { ArrowLeft, Heart, MessageCircle, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { Toast } from "../components/ui/Toast";
import { CarFormSheet } from "../features/CarFormSheet";
import { useClubData } from "../lib/clubData";
import { supabase } from "../lib/supabase";

export const CarDetailPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { loading, currentProfile, cars, refresh } = useClubData();
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
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

  const canManage =
    Boolean(currentProfile) &&
    (currentProfile?.id === car.ownerId || currentProfile?.role === "admin" || currentProfile?.role === "staff");

  const hideCar = async () => {
    if (!supabase || !canManage) {
      setMessage("Nu ai acces pentru aceasta actiune.");
      return;
    }

    setBusyDelete(true);
    const { error } = await supabase.from("cars").update({ hidden_at: new Date().toISOString() }).eq("id", car.id);

    if (error) {
      setMessage(error.message);
      setBusyDelete(false);
      return;
    }

    await refresh();
    setMessage("Masina a fost ascunsa din garaj.");
    window.setTimeout(() => navigate("/garaj"), 700);
  };

  return (
    <div className="space-y-6">
      <Toast message={message ?? ""} visible={Boolean(message)} />

      <Link to="/garaj" className="inline-flex items-center gap-2 text-sm font-bold text-white/58 hover:text-white">
        <ArrowLeft size={17} />
        Inapoi
      </Link>

      <PageHeader
        eyebrow={`${car.generation} - ${car.city}`}
        title={car.model}
        body={`${car.ownerName} - ${car.engine} - ${car.powerHp} CP`}
        action={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<Pencil size={18} />} onClick={() => setFormOpen(true)}>
                Editeaza
              </Button>
              <Button variant="danger" icon={<Trash2 size={18} />} onClick={hideCar} disabled={busyDelete}>
                Ascunde
              </Button>
            </div>
          ) : null
        }
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
            <Badge tone={car.approved ? "green" : "red"}>{car.approved ? "Aprobat" : "Ascuns"}</Badge>
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
        {car.mods.length > 0 ? (
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
        ) : (
          <Card className="p-4 text-sm text-white/56">Nu sunt modificari publicate pentru masina asta.</Card>
        )}
      </section>

      <CarFormSheet
        open={formOpen}
        currentProfile={currentProfile}
        car={car}
        onClose={() => setFormOpen(false)}
        onSaved={(savedMessage) => {
          setMessage(savedMessage);
          void refresh();
        }}
      />
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
