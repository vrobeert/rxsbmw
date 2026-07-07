import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { AdminMemberRow, Announcement, Car, CarMod, ClubEvent, EventScheduleItem, PaymentStatus, Profile, Registration, Sponsor } from "../types";
import { carPlaceholder, eventPlaceholder, avatarPlaceholder } from "./placeholders";
import { hasSupabaseConfig, supabase } from "./supabase";

interface ClubData {
  readonly loading: boolean;
  readonly error: string | null;
  readonly isDemo: boolean;
  readonly currentProfile: Profile | null;
  readonly profiles: readonly Profile[];
  readonly cars: readonly Car[];
  readonly events: readonly ClubEvent[];
  readonly sponsors: readonly Sponsor[];
  readonly announcements: readonly Announcement[];
  readonly registrations: readonly Registration[];
  readonly adminMembers: readonly AdminMemberRow[];
  readonly refresh: () => Promise<void>;
}

const ClubDataContext = createContext<ClubData | null>(null);

interface ClubDataState {
  readonly currentProfile: Profile | null;
  readonly profiles: readonly Profile[];
  readonly cars: readonly Car[];
  readonly events: readonly ClubEvent[];
  readonly sponsors: readonly Sponsor[];
  readonly announcements: readonly Announcement[];
  readonly registrations: readonly Registration[];
  readonly adminMembers: readonly AdminMemberRow[];
}

const emptyData: ClubDataState = {
  currentProfile: null,
  profiles: [],
  cars: [],
  events: [],
  sponsors: [],
  announcements: [],
  registrations: [],
  adminMembers: []
};

export const ClubDataProvider = ({ children }: { readonly children: ReactNode }) => {
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClubDataState>(emptyData);

  const load = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setData(emptyData);
      setError("Lipsesc VITE_SUPABASE_URL si VITE_SUPABASE_ANON_KEY in environment.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData.session?.user ?? null;
      const userId = authUser?.id ?? null;

      if (authUser) {
        await ensureCurrentUserProfile(authUser);
      }

      const [
        profilesResult,
        membershipsResult,
        carsResult,
        photosResult,
        modsResult,
        likesResult,
        commentsResult,
        eventsResult,
        scheduleResult,
        categoriesResult,
        sponsorsResult,
        eventSponsorsResult,
        announcementsResult,
        registrationsResult
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("memberships").select("*").order("year", { ascending: false }),
        supabase.from("cars").select("*").order("created_at", { ascending: false }),
        supabase.from("car_photos").select("*").order("sort_order", { ascending: true }),
        supabase.from("car_mods").select("*").order("sort_order", { ascending: true }),
        supabase.from("car_likes").select("*"),
        supabase.from("car_comments").select("*"),
        supabase.from("events").select("*").eq("status", "published").order("starts_at", { ascending: true }),
        supabase.from("event_schedule_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("event_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("sponsors").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("event_sponsors").select("*").order("sort_order", { ascending: true }),
        supabase.from("announcements").select("*").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }),
        userId ? supabase.from("event_registrations").select("*").eq("profile_id", userId) : Promise.resolve({ data: [], error: null })
      ]);

      const firstError =
        profilesResult.error ??
        membershipsResult.error ??
        carsResult.error ??
        photosResult.error ??
        modsResult.error ??
        likesResult.error ??
        commentsResult.error ??
        eventsResult.error ??
        scheduleResult.error ??
        categoriesResult.error ??
        sponsorsResult.error ??
        eventSponsorsResult.error ??
        announcementsResult.error ??
        registrationsResult.error;

      if (firstError) {
        throw firstError;
      }

      const profileRows = profilesResult.data ?? [];
      const membershipRows = membershipsResult.data ?? [];
      const carRows = carsResult.data ?? [];
      const photoRows = photosResult.data ?? [];
      const modRows = modsResult.data ?? [];
      const likeRows = likesResult.data ?? [];
      const commentRows = commentsResult.data ?? [];
      const eventRows = eventsResult.data ?? [];
      const scheduleRows = scheduleResult.data ?? [];
      const categoryRows = categoriesResult.data ?? [];
      const sponsorRows = sponsorsResult.data ?? [];
      const eventSponsorRows = eventSponsorsResult.data ?? [];
      const announcementRows = announcementsResult.data ?? [];
      let registrationRows = registrationsResult.data ?? [];

      const membershipsByProfile = new Map(
        membershipRows.map((membership) => [membership.profile_id, membership])
      );
      const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]));

      const profiles = profileRows.map((profile): Profile => {
        const membership = membershipsByProfile.get(profile.id);

        return {
          id: profile.id,
          fullName: profile.full_name,
          city: profile.city ?? "Romania",
          role: profile.role,
          level: profile.member_level,
          avatarUrl: profile.avatar_url ?? avatarPlaceholder(profile.full_name),
          bio: profile.bio ?? "",
          joinedAt: profile.joined_at,
          membershipPaid: membership?.paid ?? false,
          membershipExpiresAt: membership?.expires_at ?? profile.joined_at,
          memberCode: profile.member_code
        };
      });

      const currentProfile = profiles.find((profile) => profile.id === userId) ?? null;
      const canSeeAdminRows = currentProfile?.role === "admin" || currentProfile?.role === "staff";

      if (canSeeAdminRows) {
        const allRegistrationsResult = await supabase.from("event_registrations").select("*");

        if (allRegistrationsResult.error) {
          throw allRegistrationsResult.error;
        }

        registrationRows = allRegistrationsResult.data ?? [];
      }

      const photosByCar = groupBy(photoRows, (photo) => photo.car_id);
      const modsByCar = groupBy(modRows, (mod) => mod.car_id);
      const likesByCar = groupBy(likeRows, (like) => like.car_id);
      const commentsByCar = groupBy(commentRows.filter((comment) => !comment.hidden_at), (comment) => comment.car_id);

      const cars = carRows
        .filter((car) => car.approved && !car.hidden_at)
        .map((car): Car => {
          const owner = profilesById.get(car.profile_id);
          const photos = (photosByCar.get(car.id) ?? []).map((photo) => publicStorageUrl("car-photos", photo.storage_path));
          const coverPhoto =
            photoRows.find((photo) => photo.id === car.cover_photo_id)?.storage_path ??
            photosByCar.get(car.id)?.[0]?.storage_path ??
            null;
          const coverUrl = coverPhoto ? publicStorageUrl("car-photos", coverPhoto) : carPlaceholder(car.model);
          const mods: CarMod[] = (modsByCar.get(car.id) ?? []).map((mod) => ({
            category: mod.category,
            description: mod.description
          }));

          return {
            id: car.id,
            ownerId: car.profile_id,
            ownerName: owner?.full_name ?? "Membru BMW",
            model: car.model,
            generation: car.generation,
            engine: car.engine ?? "Nespecificat",
            powerHp: car.power_hp ?? 0,
            year: car.year ?? new Date().getFullYear(),
            color: car.color ?? "Nespecificat",
            coverUrl,
            photos: photos.length > 0 ? photos : [coverUrl],
            mods,
            likes: likesByCar.get(car.id)?.length ?? 0,
            comments: commentsByCar.get(car.id)?.length ?? 0,
            city: owner?.city ?? "Romania",
            approved: car.approved
          };
        });

      const scheduleByEvent = groupBy(scheduleRows, (item) => item.event_id);
      const categoriesByEvent = groupBy(categoryRows, (item) => item.event_id);
      const registrationsByEvent = groupBy(registrationRows, (registration) => registration.event_id);
      const checkedInByEvent = groupBy(registrationRows.filter((registration) => registration.checked_in_at), (registration) => registration.event_id);
      const sponsorIdsByEvent = groupBy(eventSponsorRows, (item) => item.event_id);

      const events = eventRows.map((event): ClubEvent => {
        const city = event.city ?? "Romania";
        const schedule: EventScheduleItem[] = (scheduleByEvent.get(event.id) ?? []).map((item) => ({
          time: item.starts_at.slice(0, 5),
          title: item.title
        }));

        return {
          id: event.id,
          title: event.title,
          status: new Date(event.starts_at).getTime() >= Date.now() ? "upcoming" : "past",
          coverUrl: event.cover_url ?? eventPlaceholder(event.title, city),
          city,
          location: event.location_address ?? event.location_name ?? city,
          date: event.starts_at,
          priceRon: Number(event.price_ron),
          description: event.description ?? "",
          checkedInCount: checkedInByEvent.get(event.id)?.length ?? 0,
          registeredCount: registrationsByEvent.get(event.id)?.length ?? 0,
          schedule,
          categories: (categoriesByEvent.get(event.id) ?? []).map((category) => category.name),
          sponsorIds: (sponsorIdsByEvent.get(event.id) ?? []).map((item) => item.sponsor_id)
        };
      });

      const sponsors = sponsorRows.map((sponsor): Sponsor => ({
        id: sponsor.id,
        name: sponsor.name,
        logoText: sponsor.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("") || "BH",
        website: sponsor.website ?? "#"
      }));

      const announcements = announcementRows.map((announcement): Announcement => ({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        publishedAt: announcement.published_at
      }));

      const registrations = registrationRows.map((registration): Registration => {
        const category = categoryRows.find((item) => item.id === registration.category_id);

        return {
          id: registration.id,
          eventId: registration.event_id,
          profileId: registration.profile_id,
          category: category?.name ?? "General",
          qrToken: registration.qr_token,
          paymentStatus: normalizePaymentStatus(registration.payment_status),
          checkedInAt: registration.checked_in_at
        };
      });

      const adminMembers = canSeeAdminRows
        ? profiles.map((profile): AdminMemberRow => ({
            id: profile.id,
            name: profile.fullName,
            city: profile.city,
            role: profile.role,
            level: profile.level,
            membershipPaid: profile.membershipPaid
          }))
        : [];

      setData({
        currentProfile,
        profiles,
        cars,
        events,
        sponsors,
        announcements,
        registrations,
        adminMembers
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Nu am putut incarca datele din Supabase.";
      setError(message);
      setData(emptyData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    if (!hasSupabaseConfig || !supabase) {
      return undefined;
    }

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => listener.subscription.unsubscribe();
  }, [load]);

  const value = useMemo<ClubData>(
    () => ({
      ...data,
      loading,
      error,
      isDemo: false,
      refresh: load
    }),
    [data, error, load, loading]
  );

  return <ClubDataContext.Provider value={value}>{children}</ClubDataContext.Provider>;
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);

  if (!context) {
    throw new Error("useClubData must be used inside ClubDataProvider");
  }

  return context;
};

const groupBy = <T, K>(items: readonly T[], getKey: (item: T) => K) => {
  const map = new Map<K, T[]>();

  items.forEach((item) => {
    const key = getKey(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  });

  return map;
};

const publicStorageUrl = (bucket: string, path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  if (!supabase) {
    return path;
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const ensureCurrentUserProfile = async (user: User) => {
  if (!supabase) {
    return;
  }

  const { data: existingProfile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingProfile) {
    return;
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: getProfileName(user),
    city: "Romania"
  });

  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }
};

const getProfileName = (user: User) => {
  const metadata = user.user_metadata ?? {};
  const metadataName =
    textFromMetadata(metadata.full_name) ??
    textFromMetadata(metadata.name) ??
    textFromMetadata(metadata.display_name);

  const emailName = user.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  const name = metadataName ?? emailName ?? "Membru BMW";

  return name.replace(/\s+/g, " ").trim() || "Membru BMW";
};

const textFromMetadata = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

const normalizePaymentStatus = (status: "pending" | "cash" | "transfer" | "paid" | "refunded"): PaymentStatus => {
  if (status === "refunded") {
    return "pending";
  }

  return status;
};
