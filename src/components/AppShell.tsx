import { CalendarDays, CarFront, Home, QrCode, ShieldCheck, UserRound } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { brand } from "../brand";
import { useClubData } from "../lib/clubData";
import { cn } from "../lib/cn";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { TabBar, type TabItem } from "./ui/TabBar";

const memberTabs: TabItem[] = [
  { label: "Acasa", to: "/", icon: Home },
  { label: "Garaj", to: "/garaj", icon: CarFront },
  { label: "Evenimente", to: "/evenimente", icon: CalendarDays },
  { label: "Profil", to: "/profil", icon: UserRound }
];

const staffTabs: TabItem[] = [
  ...memberTabs,
  { label: "Admin", to: "/admin", icon: ShieldCheck }
];

const sidebarItems: TabItem[] = [
  ...staffTabs,
  { label: "Scan QR", to: "/scan", icon: QrCode }
];

export const AppShell = () => {
  const { currentProfile } = useClubData();
  const canUseStaffTools = currentProfile?.role === "admin" || currentProfile?.role === "staff";
  const tabs = canUseStaffTools ? staffTabs : memberTabs;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen border-r border-white/8 bg-[#0a0a0c]/76 px-5 py-6 backdrop-blur-xl lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/8">
              <span className="text-sm font-black">BH</span>
            </div>
            <div>
              <p className="text-base font-black">{brand.name}</p>
              <p className="text-xs font-semibold text-white/48">{brand.projectName}</p>
            </div>
          </div>

          {currentProfile ? (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
              <Avatar src={currentProfile.avatarUrl} name={currentProfile.fullName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{currentProfile.fullName}</p>
                <p className="text-xs text-white/48">{currentProfile.city}</p>
              </div>
            </div>
          ) : (
            <Link to="/login" className="tap mt-8 block rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-sm font-bold">Vizitator</p>
              <p className="mt-1 text-xs text-white/48">Intra in cont pentru profil si bilete.</p>
            </Link>
          )}

          <nav className="mt-8 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isStaffRoute = item.to === "/admin" || item.to === "/scan";

              if (isStaffRoute && !canUseStaffTools) {
                return null;
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "tap flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/58 hover:bg-white/7 hover:text-white",
                      isActive && "bg-white text-[#0a0a0c] shadow-xl"
                    )
                  }
                >
                  <Icon size={20} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/8 bg-white/5 p-4">
            <Badge tone={canUseStaffTools ? "m" : "muted"}>{canUseStaffTools ? "Staff ready" : "Member view"}</Badge>
            <p className="mt-3 text-sm leading-6 text-white/56">
              {canUseStaffTools
                ? "Pe desktop ai spatiu real pentru administrare, tabele si scanare."
                : "Datele vin din Supabase dupa autentificare."}
            </p>
          </div>
        </aside>

        <main className="min-w-0 pb-28 lg:pb-8">
          <div className="safe-top mx-auto w-full max-w-[1120px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <TabBar items={tabs} />
    </div>
  );
};
