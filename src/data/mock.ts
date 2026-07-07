import type { AdminMemberRow, Announcement, Car, ClubEvent, Profile, Registration, Sponsor } from "../types";

const svgData = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const carArt = (label: string, main: string, glow: string, accent: string) =>
  svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#08080b"/>
          <stop offset="0.55" stop-color="${glow}"/>
          <stop offset="1" stop-color="#111117"/>
        </linearGradient>
        <linearGradient id="car" x1="0" x2="1">
          <stop offset="0" stop-color="${main}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="24"/></filter>
      </defs>
      <rect width="1200" height="760" fill="url(#bg)"/>
      <ellipse cx="600" cy="604" rx="420" ry="56" fill="#000" opacity="0.55" filter="url(#blur)"/>
      <path d="M214 466c35-94 113-137 236-143l66-78c24-29 55-44 93-44h147c37 0 68 14 94 42l91 97c78 13 128 52 150 126l-47 71H253z" fill="url(#car)"/>
      <path d="M480 324l54-66c15-18 35-27 59-27h131c25 0 46 9 63 28l63 70z" fill="#0b0b10" opacity="0.84"/>
      <path d="M236 472h174M795 472h260" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.72"/>
      <circle cx="421" cy="535" r="74" fill="#09090d" stroke="#24242d" stroke-width="24"/>
      <circle cx="421" cy="535" r="28" fill="#dfe8ff"/>
      <circle cx="822" cy="535" r="74" fill="#09090d" stroke="#24242d" stroke-width="24"/>
      <circle cx="822" cy="535" r="28" fill="#dfe8ff"/>
      <path d="M175 535h850" stroke="#fff" stroke-width="3" opacity="0.16"/>
      <text x="70" y="105" fill="#fff" font-family="Inter, Arial" font-size="58" font-weight="800">${label}</text>
      <text x="72" y="158" fill="#d8d8e4" font-family="Inter, Arial" font-size="28" font-weight="500">BavarianHub garage preview</text>
    </svg>
  `);

const avatar = (initials: string, bg: string) =>
  svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="80" fill="${bg}"/>
      <circle cx="188" cy="48" r="50" fill="#ffffff" opacity="0.14"/>
      <text x="120" y="136" text-anchor="middle" fill="#fff" font-family="Inter, Arial" font-size="64" font-weight="800">${initials}</text>
    </svg>
  `);

const eventArt = (label: string, city: string, accent: string) =>
  svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#08080b"/>
          <stop offset="0.55" stop-color="${accent}"/>
          <stop offset="1" stop-color="#101016"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#g)"/>
      <path d="M0 545c148-72 287-92 416-61 112 28 208 84 325 80 122-4 264-73 459-49v245H0z" fill="#050507" opacity="0.78"/>
      <path d="M136 506c80-116 181-174 303-174h328c125 0 224 58 297 174" fill="none" stroke="#fff" stroke-width="18" opacity="0.32"/>
      <path d="M180 512h840" stroke="#fff" stroke-width="7" opacity="0.42"/>
      <text x="72" y="132" fill="#fff" font-family="Inter, Arial" font-size="64" font-weight="850">${label}</text>
      <text x="76" y="190" fill="#e8e8f4" font-family="Inter, Arial" font-size="32">${city}</text>
    </svg>
  `);

export const demoProfile: Profile = {
  id: "profile-1",
  fullName: "Robert Ionescu",
  city: "Galati",
  role: "admin",
  level: "Elite",
  avatarUrl: avatar("RI", "#1C69D4"),
  bio: "Organizator meet-uri si pasionat de proiecte curate pe seria 3.",
  joinedAt: "2024-03-18",
  membershipPaid: true,
  membershipExpiresAt: "2026-12-31",
  memberCode: "BH-0001"
};

export const profiles: Profile[] = [
  demoProfile,
  {
    id: "profile-2",
    fullName: "Andrei Popa",
    city: "Braila",
    role: "staff",
    level: "Gold",
    avatarUrl: avatar("AP", "#003DA5"),
    bio: "Staff check-in si fotograf la evenimente.",
    joinedAt: "2024-06-10",
    membershipPaid: true,
    membershipExpiresAt: "2026-11-30",
    memberCode: "BH-0042"
  },
  {
    id: "profile-3",
    fullName: "Mihai Stan",
    city: "Bucuresti",
    role: "member",
    level: "Silver",
    avatarUrl: avatar("MS", "#23232b"),
    bio: "Daily diesel, weekend detailing.",
    joinedAt: "2025-01-08",
    membershipPaid: false,
    membershipExpiresAt: "2026-04-20",
    memberCode: "BH-0108"
  },
  {
    id: "profile-4",
    fullName: "Daria Enache",
    city: "Constanta",
    role: "member",
    level: "Gold",
    avatarUrl: avatar("DE", "#E40521"),
    bio: "Oldschool coupe si drumuri pe coasta.",
    joinedAt: "2025-08-02",
    membershipPaid: true,
    membershipExpiresAt: "2027-01-15",
    memberCode: "BH-0117"
  }
];

export const cars: Car[] = [
  {
    id: "car-e36",
    ownerId: "profile-1",
    ownerName: "Robert Ionescu",
    model: "BMW E36 328i Coupe",
    generation: "E36",
    engine: "M52B28",
    powerHp: 238,
    year: 1997,
    color: "Arctic Silver",
    coverUrl: carArt("E36 328i", "#bfc6d1", "#20314c", "#f6f7fb"),
    photos: [
      carArt("E36 front", "#bfc6d1", "#20314c", "#ffffff"),
      carArt("E36 rear", "#9aa3b2", "#1C69D4", "#e8ecf4")
    ],
    mods: [
      { category: "Suspensie", description: "coilovers reglabile, setare street" },
      { category: "Evacuare", description: "linie inox custom" },
      { category: "Jante", description: "Style 32, 17 inch" }
    ],
    likes: 248,
    comments: 31,
    city: "Galati",
    approved: true
  },
  {
    id: "car-e46",
    ownerId: "profile-2",
    ownerName: "Andrei Popa",
    model: "BMW E46 330d Touring",
    generation: "E46",
    engine: "M57D30",
    powerHp: 265,
    year: 2004,
    color: "Orient Blue",
    coverUrl: carArt("E46 330d", "#123f75", "#061f3a", "#1C69D4"),
    photos: [carArt("E46 touring", "#123f75", "#061f3a", "#00A0DE")],
    mods: [
      { category: "Motor", description: "soft stage 1, intercooler marit" },
      { category: "Interior", description: "scaune sport incalzite" }
    ],
    likes: 184,
    comments: 18,
    city: "Braila",
    approved: true
  },
  {
    id: "car-f30",
    ownerId: "profile-3",
    ownerName: "Mihai Stan",
    model: "BMW F30 340i",
    generation: "F30",
    engine: "B58",
    powerHp: 382,
    year: 2018,
    color: "Mineral Grey",
    coverUrl: carArt("F30 340i", "#5b6472", "#171922", "#8a94a6"),
    photos: [carArt("F30 side", "#5b6472", "#171922", "#ffffff")],
    mods: [
      { category: "Motor", description: "downpipe si soft conservator" },
      { category: "Frane", description: "M Performance calipers" }
    ],
    likes: 321,
    comments: 44,
    city: "Bucuresti",
    approved: true
  },
  {
    id: "car-e92",
    ownerId: "profile-4",
    ownerName: "Daria Enache",
    model: "BMW E92 M3",
    generation: "E92",
    engine: "S65 V8",
    powerHp: 420,
    year: 2011,
    color: "Alpine White",
    coverUrl: carArt("E92 M3", "#f2f3f6", "#2a1c1f", "#E40521"),
    photos: [carArt("E92 V8", "#f2f3f6", "#2a1c1f", "#E40521")],
    mods: [
      { category: "Evacuare", description: "cat-back valvetronic" },
      { category: "Exterior", description: "carbon lip si diffuser" }
    ],
    likes: 512,
    comments: 67,
    city: "Constanta",
    approved: true
  }
];

export const sponsors: Sponsor[] = [
  { id: "sponsor-1", name: "RXS Studio Detailing", logoText: "RXS", website: "https://example.com/rxs" },
  { id: "sponsor-2", name: "Nord Wheels", logoText: "NW", website: "https://example.com/nord" },
  { id: "sponsor-3", name: "TurboLab Galati", logoText: "TL", website: "https://example.com/turbolab" }
];

export const events: ClubEvent[] = [
  {
    id: "event-2026-galati",
    title: "BMW Fest Galati 2026",
    status: "upcoming",
    coverUrl: eventArt("BMW Fest 2026", "Galati", "#163f7a"),
    city: "Galati",
    location: "Faleza Dunarii, Galati",
    date: "2026-08-22T16:00:00+03:00",
    priceRon: 60,
    description: "Meet premium cu zone dedicate pentru garaj, jurizare usoara si check-in rapid prin QR.",
    checkedInCount: 87,
    registeredCount: 164,
    schedule: [
      { time: "16:00", title: "Check-in si asezare pe categorii" },
      { time: "18:00", title: "Parada pe faleza" },
      { time: "20:00", title: "Premii si sesiune foto" }
    ],
    categories: ["E30", "E36", "E46", "E9x", "F30", "G-series", "M", "Oldschool", "Altele"],
    sponsorIds: ["sponsor-1", "sponsor-2", "sponsor-3"]
  },
  {
    id: "event-2025-braila",
    title: "Night Meet Braila",
    status: "past",
    coverUrl: eventArt("Night Meet", "Braila", "#3b1820"),
    city: "Braila",
    location: "Promenada Mall Braila",
    date: "2025-09-13T19:00:00+03:00",
    priceRon: 30,
    description: "Eveniment de seara cu galerie foto si zona pentru proiecte oldschool.",
    checkedInCount: 92,
    registeredCount: 104,
    schedule: [
      { time: "19:00", title: "Intrare participanti" },
      { time: "20:30", title: "Tur foto" },
      { time: "22:00", title: "Best stance" }
    ],
    categories: ["E36", "E46", "E9x", "M", "Oldschool"],
    sponsorIds: ["sponsor-1", "sponsor-2"]
  }
];

export const registrations: Registration[] = [
  {
    id: "registration-1",
    eventId: "event-2026-galati",
    profileId: "profile-1",
    category: "E36",
    qrToken: "4a4b624d-19dc-4e8f-9b98-cf4ad7f72001",
    paymentStatus: "paid",
    checkedInAt: null
  }
];

export const announcements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Inscrierile pentru BMW Fest Galati sunt deschise",
    body: "Primele 100 de masini inscrise primesc zona prioritara la intrare.",
    publishedAt: "2026-07-01"
  },
  {
    id: "announcement-2",
    title: "Cautam voluntari pentru check-in",
    body: "Staff-ul poate folosi pagina de scanare de pe telefon sau laptop cu camera.",
    publishedAt: "2026-07-03"
  }
];

export const adminMembers: AdminMemberRow[] = profiles.map((profile) => ({
  id: profile.id,
  name: profile.fullName,
  city: profile.city,
  role: profile.role,
  level: profile.level,
  membershipPaid: profile.membershipPaid
}));
