import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { cars, demoProfile } from "../data/mock";
import { CarCard } from "../features/CarCard";

type GarageFilter = "Recente" | "Populare" | "Garajul meu";

const filters: readonly GarageFilter[] = ["Recente", "Populare", "Garajul meu"];

export const GaragePage = () => {
  const [filter, setFilter] = useState<GarageFilter>("Recente");

  const visibleCars = useMemo(() => {
    if (filter === "Populare") {
      return [...cars].sort((a, b) => b.likes - a.likes);
    }

    if (filter === "Garajul meu") {
      return cars.filter((car) => car.ownerId === demoProfile.id);
    }

    return cars;
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Garaj virtual"
        title="Proiectele membrilor"
        body="Feed public cu masini aprobate, like la dublu tap si pagini detaliate pentru fiecare proiect."
        action={<Button icon={<Plus size={18} />}>Adauga masina</Button>}
      />

      <SegmentedControl options={filters} value={filter} onChange={setFilter} />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {visibleCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};
