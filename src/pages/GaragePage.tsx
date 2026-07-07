import { Plus, CarFront } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { Toast } from "../components/ui/Toast";
import { CarCard } from "../features/CarCard";
import { CarFormSheet } from "../features/CarFormSheet";
import { useClubData } from "../lib/clubData";

type GarageFilter = "Recente" | "Populare" | "Garajul meu";

const filters: readonly GarageFilter[] = ["Recente", "Populare", "Garajul meu"];

export const GaragePage = () => {
  const { loading, currentProfile, cars, refresh } = useClubData();
  const [filter, setFilter] = useState<GarageFilter>("Recente");
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("add") === "1");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setFormOpen(true);
    }
  }, [searchParams]);

  const visibleCars = useMemo(() => {
    if (filter === "Populare") {
      return [...cars].sort((a, b) => b.likes - a.likes);
    }

    if (filter === "Garajul meu") {
      return currentProfile ? cars.filter((car) => car.ownerId === currentProfile.id) : [];
    }

    return cars;
  }, [cars, currentProfile, filter]);

  if (loading) {
    return <SkeletonLoader rows={5} />;
  }

  return (
    <div className="space-y-6">
      <Toast message={message ?? ""} visible={Boolean(message)} />
      <PageHeader
        eyebrow="Garaj virtual"
        title="Proiectele membrilor"
        body="Feed public cu masini aprobate, like la dublu tap si pagini detaliate pentru fiecare proiect."
        action={
          <Button icon={<Plus size={18} />} onClick={() => setFormOpen(true)}>
            Adauga masina
          </Button>
        }
      />

      <SegmentedControl options={filters} value={filter} onChange={setFilter} />

      {visibleCars.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CarFront size={24} />}
          title={filter === "Garajul meu" ? "Nu ai masini in garaj" : "Nu exista masini publicate"}
          body="Masinile adaugate si aprobate in Supabase vor aparea aici."
        />
      )}

      <CarFormSheet
        open={formOpen}
        currentProfile={currentProfile}
        onClose={() => {
          setFormOpen(false);
          setSearchParams({});
        }}
        onSaved={(savedMessage) => {
          setMessage(savedMessage);
          void refresh();
        }}
      />
    </div>
  );
};
