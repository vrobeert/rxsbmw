import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { supabase } from "../lib/supabase";
import type { Car, Profile } from "../types";

interface CarFormSheetProps {
  readonly open: boolean;
  readonly currentProfile: Profile | null;
  readonly car?: Car;
  readonly onClose: () => void;
  readonly onSaved: (message: string) => void;
}

interface ModFormRow {
  readonly id: string;
  readonly category: string;
  readonly description: string;
}

const defaultGeneration = "E21";

const generations = [
  "E21",
  "E30",
  "E36",
  "E46",
  "E90/E91/E92/E93",
  "F30/F31/F34",
  "G20/G21",
  "G22/G23",
  "E39",
  "E60/E61",
  "F10/F11",
  "G30/G31",
  "G60/G61",
  "M2",
  "M3",
  "M4",
  "M5",
  "M8",
  "X1",
  "X3",
  "X5",
  "X6",
  "X7",
  "i3",
  "i4",
  "i5",
  "i7",
  "Alta generatie"
];

const emptyMod = (): ModFormRow => ({
  id: crypto.randomUUID(),
  category: "",
  description: ""
});

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/34";

const textAreaClass =
  "mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/34";

export const CarFormSheet = ({ open, currentProfile, car, onClose, onSaved }: CarFormSheetProps) => {
  const [model, setModel] = useState("");
  const [generation, setGeneration] = useState(defaultGeneration);
  const [engine, setEngine] = useState("");
  const [powerHp, setPowerHp] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [mods, setMods] = useState<ModFormRow[]>([emptyMod()]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mode = car ? "edit" : "create";
  const title = mode === "edit" ? "Editeaza masina" : "Adauga masina";
  const photoPreviews = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setModel(car?.model ?? "");
    setGeneration(car?.generation ?? defaultGeneration);
    setEngine(car?.engine ?? "");
    setPowerHp(car?.powerHp ? String(car.powerHp) : "");
    setYear(car?.year ? String(car.year) : "");
    setColor(car?.color ?? "");
    setMods(car?.mods.length ? car.mods.map((mod) => ({ ...mod, id: crypto.randomUUID() })) : [emptyMod()]);
    setPhotos([]);
    setError(null);
  }, [car, open]);

  useEffect(
    () => () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    },
    [photoPreviews]
  );

  const updateMod = (id: string, field: "category" | "description", value: string) => {
    setMods((current) => current.map((mod) => (mod.id === id ? { ...mod, [field]: value } : mod)));
  };

  const removeMod = (id: string) => {
    setMods((current) => (current.length === 1 ? [emptyMod()] : current.filter((mod) => mod.id !== id)));
  };

  const handlePhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    setPhotos((current) => [...current, ...selected].slice(0, 20));
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentProfile || !supabase) {
      setError("Trebuie sa fii autentificat ca sa salvezi masina.");
      return;
    }

    const parsedYear = year ? Number(year) : null;
    const parsedPower = powerHp ? Number(powerHp) : null;

    if (!model.trim()) {
      setError("Completeaza modelul masinii.");
      return;
    }

    if (parsedYear && (!Number.isFinite(parsedYear) || parsedYear < 1950 || parsedYear > new Date().getFullYear() + 1)) {
      setError("Anul masinii nu pare valid.");
      return;
    }

    if (parsedPower && (!Number.isFinite(parsedPower) || parsedPower < 1)) {
      setError("Puterea trebuie sa fie mai mare decat 0.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const carPayload = {
        model: model.trim(),
        generation: generation || defaultGeneration,
        engine: engine.trim() || null,
        power_hp: parsedPower,
        year: parsedYear,
        color: color.trim() || null,
        approved: true
      };

      const savedCarId = car?.id ?? (await createCar({ ...carPayload, profile_id: currentProfile.id }));

      if (car) {
        const { error: updateError } = await supabase.from("cars").update(carPayload).eq("id", car.id);
        if (updateError) {
          throw updateError;
        }
      }

      await replaceMods(savedCarId, mods);
      await uploadPhotos(savedCarId, currentProfile.id, photos, !car || car.photos.length === 0);

      onSaved(mode === "edit" ? "Masina a fost actualizata." : "Masina a fost adaugata in garaj.");
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nu am putut salva masina.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      {!currentProfile ? (
        <EmptyState
          icon={<ImagePlus size={24} />}
          title="Autentificare necesara"
          body="Intra in cont ca sa poti adauga masini in garaj."
          action={
            <Link to="/login">
              <Button>Intra in cont</Button>
            </Link>
          }
        />
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          {error ? <p className="rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">{error}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-white/70">Model</span>
              <input className={inputClass} value={model} onChange={(eventChange) => setModel(eventChange.target.value)} placeholder="BMW 330d" />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-white/70">Generatie</span>
              <select className={inputClass} value={generation} onChange={(eventChange) => setGeneration(eventChange.target.value)}>
                {generations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-white/70">Motor</span>
              <input className={inputClass} value={engine} onChange={(eventChange) => setEngine(eventChange.target.value)} placeholder="3.0 diesel" />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-white/70">Putere CP</span>
              <input className={inputClass} value={powerHp} onChange={(eventChange) => setPowerHp(eventChange.target.value)} inputMode="numeric" placeholder="286" />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-white/70">An</span>
              <input className={inputClass} value={year} onChange={(eventChange) => setYear(eventChange.target.value)} inputMode="numeric" placeholder="2021" />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-white/70">Culoare</span>
              <input className={inputClass} value={color} onChange={(eventChange) => setColor(eventChange.target.value)} placeholder="Albastru Portimao" />
            </label>
          </div>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">Modificari</h3>
              <Button variant="secondary" icon={<Plus size={17} />} onClick={() => setMods((current) => [...current, emptyMod()])}>
                Adauga
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {mods.map((mod) => (
                <div key={mod.id} className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      className={inputClass}
                      value={mod.category}
                      onChange={(eventChange) => updateMod(mod.id, "category", eventChange.target.value)}
                      placeholder="Categorie: soft, roti, evacuare"
                    />
                    <Button aria-label="Sterge modificarea" variant="ghost" icon={<Trash2 size={17} />} onClick={() => removeMod(mod.id)} />
                  </div>
                  <textarea
                    className={textAreaClass}
                    value={mod.description}
                    onChange={(eventChange) => updateMod(mod.id, "description", eventChange.target.value)}
                    placeholder="Descriere modificare"
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="tap flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/16 bg-white/6 p-4 text-sm font-black text-white/72">
              <ImagePlus size={18} />
              Adauga poze
              <input className="sr-only" type="file" accept="image/*" multiple onChange={handlePhotos} />
            </label>
            <p className="mt-2 text-xs leading-5 text-white/46">Maxim 20 poze. Imaginile sunt comprimate automat inainte de upload.</p>

            {photoPreviews.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photoPreviews.map((preview, index) => (
                  <div key={preview} className="relative overflow-hidden rounded-2xl border border-white/8">
                    <img src={preview} alt={`Preview ${index + 1}`} className="aspect-square w-full object-cover" />
                    <button
                      className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white"
                      type="button"
                      aria-label="Sterge poza"
                      onClick={() => removePhoto(index)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <Button fullWidth icon={<Save size={18} />} type="submit" disabled={busy}>
            {busy ? "Se salveaza..." : "Salveaza masina"}
          </Button>
        </form>
      )}
    </BottomSheet>
  );
};

const createCar = async (payload: {
  readonly profile_id: string;
  readonly model: string;
  readonly generation: string;
  readonly engine: string | null;
  readonly power_hp: number | null;
  readonly year: number | null;
  readonly color: string | null;
  readonly approved: boolean;
}) => {
  if (!supabase) {
    throw new Error("Supabase nu este configurat.");
  }

  const { data, error } = await supabase.from("cars").insert(payload).select("id").single();

  if (error) {
    throw error;
  }

  return data.id;
};

const replaceMods = async (carId: string, mods: readonly ModFormRow[]) => {
  if (!supabase) {
    return;
  }

  const cleanMods = mods
    .map((mod, index) => ({
      car_id: carId,
      category: mod.category.trim(),
      description: mod.description.trim(),
      sort_order: index
    }))
    .filter((mod) => mod.category && mod.description);

  const { error: deleteError } = await supabase.from("car_mods").delete().eq("car_id", carId);

  if (deleteError) {
    throw deleteError;
  }

  if (cleanMods.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("car_mods").insert(cleanMods);

  if (insertError) {
    throw insertError;
  }
};

const uploadPhotos = async (carId: string, profileId: string, photos: readonly File[], shouldSetCover: boolean) => {
  if (!supabase || photos.length === 0) {
    return;
  }

  const photoRows: Array<{ car_id: string; storage_path: string; alt: string; sort_order: number }> = [];

  for (const [index, photo] of photos.entries()) {
    const blob = await compressImage(photo);
    const path = `${profileId}/${carId}/${Date.now()}-${index}-${safeFileName(photo.name)}.jpg`;
    const { error: uploadError } = await supabase.storage.from("car-photos").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false
    });

    if (uploadError) {
      throw uploadError;
    }

    photoRows.push({
      car_id: carId,
      storage_path: path,
      alt: photo.name,
      sort_order: index
    });
  }

  const { data, error: insertError } = await supabase.from("car_photos").insert(photoRows).select("id").order("sort_order", { ascending: true });

  if (insertError) {
    throw insertError;
  }

  const coverPhotoId = data?.[0]?.id;

  if (shouldSetCover && coverPhotoId) {
    const { error: coverError } = await supabase.from("cars").update({ cover_photo_id: coverPhotoId }).eq("id", carId);

    if (coverError) {
      throw coverError;
    }
  }
};

const compressImage = async (file: File) => {
  const image = await loadImage(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browserul nu poate procesa imaginea.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Nu am putut comprima poza."));
        }
      },
      "image/jpeg",
      0.84
    );
  });
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Poza nu poate fi citita."));
    };
    image.src = url;
  });

const safeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "poza";
