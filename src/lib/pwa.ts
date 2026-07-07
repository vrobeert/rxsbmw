export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    const isLocal = import.meta.env.DEV || localHosts.has(window.location.hostname);

    if (isLocal) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => {
          if (!("caches" in window)) {
            return undefined;
          }

          return caches
            .keys()
            .then((keys) =>
              Promise.all(keys.filter((key) => key.startsWith("bavarianhub-")).map((key) => caches.delete(key)))
            );
        })
        .then(() => {
          if (navigator.serviceWorker.controller) {
            window.location.reload();
          }
        })
        .catch(() => undefined);
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.update().catch(() => undefined);
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      })
      .catch(() => undefined);
  });
};

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}
