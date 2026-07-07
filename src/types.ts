export type MemberLevel = "Bronze" | "Silver" | "Gold" | "Elite";
export type UserRole = "member" | "staff" | "admin" | "sponsor";
export type PaymentStatus = "pending" | "cash" | "transfer" | "paid";
export type EventStatus = "upcoming" | "past";

export interface Profile {
  id: string;
  fullName: string;
  city: string;
  role: UserRole;
  level: MemberLevel;
  avatarUrl: string;
  bio: string;
  joinedAt: string;
  membershipPaid: boolean;
  membershipExpiresAt: string;
  memberCode: string;
}

export interface CarMod {
  category: string;
  description: string;
}

export interface Car {
  id: string;
  ownerId: string;
  ownerName: string;
  model: string;
  generation: string;
  engine: string;
  powerHp: number;
  year: number;
  color: string;
  coverUrl: string;
  photos: string[];
  mods: CarMod[];
  likes: number;
  comments: number;
  city: string;
  approved: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  logoText: string;
  website: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  status: EventStatus;
  coverUrl: string;
  city: string;
  location: string;
  date: string;
  priceRon: number;
  description: string;
  checkedInCount: number;
  registeredCount: number;
  schedule: EventScheduleItem[];
  categories: string[];
  sponsorIds: string[];
}

export interface Registration {
  id: string;
  eventId: string;
  profileId: string;
  category: string;
  qrToken: string;
  paymentStatus: PaymentStatus;
  checkedInAt: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
}

export interface AdminMemberRow {
  id: string;
  name: string;
  city: string;
  role: UserRole;
  level: MemberLevel;
  membershipPaid: boolean;
}
