import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ClubDataProvider } from "./lib/clubData";

const AdminPage = lazy(async () => ({ default: (await import("./pages/AdminPage")).AdminPage }));
const AuthPage = lazy(async () => ({ default: (await import("./pages/AuthPage")).AuthPage }));
const CarDetailPage = lazy(async () => ({ default: (await import("./pages/CarDetailPage")).CarDetailPage }));
const EventDetailPage = lazy(async () => ({ default: (await import("./pages/EventDetailPage")).EventDetailPage }));
const EventsPage = lazy(async () => ({ default: (await import("./pages/EventsPage")).EventsPage }));
const GaragePage = lazy(async () => ({ default: (await import("./pages/GaragePage")).GaragePage }));
const HomePage = lazy(async () => ({ default: (await import("./pages/HomePage")).HomePage }));
const ProfilePage = lazy(async () => ({ default: (await import("./pages/ProfilePage")).ProfilePage }));
const ScannerPage = lazy(async () => ({ default: (await import("./pages/ScannerPage")).ScannerPage }));

const withFallback = (children: ReactNode) => (
  <Suspense
    fallback={
      <div className="grid min-h-[60vh] place-items-center text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[#1C69D4]" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: withFallback(<AuthPage />)
  },
  {
    path: "/",
    element: (
      <ClubDataProvider>
        <AppShell />
      </ClubDataProvider>
    ),
    children: [
      { index: true, element: withFallback(<HomePage />) },
      { path: "garaj", element: withFallback(<GaragePage />) },
      { path: "garaj/:carId", element: withFallback(<CarDetailPage />) },
      { path: "evenimente", element: withFallback(<EventsPage />) },
      { path: "evenimente/:eventId", element: withFallback(<EventDetailPage />) },
      { path: "profil", element: withFallback(<ProfilePage />) },
      { path: "admin", element: withFallback(<AdminPage />) },
      { path: "scan", element: withFallback(<ScannerPage />) }
    ]
  }
]);

export const App = () => <RouterProvider router={router} />;
