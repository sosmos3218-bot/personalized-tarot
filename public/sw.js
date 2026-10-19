/* 별빛 타로 service worker: offline fallback + Web Push */
const CACHE_VERSION = "starlight-v2";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(new Request(url, { cache: "reload" }));
            if (res.ok) await cache.put(url, res);
          } catch (_) {
            /* skip; offline fallback still works for the rest */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      );
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (_) {
          /* ignore */
        }
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: always network-first (no caching of authenticated HTML);
  // fall back to the precached offline page only when the network fails.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;
          return await fetch(req);
        } catch (_) {
          const cache = await caches.open(CACHE_VERSION);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ||
            new Response("오프라인 상태예요. 연결을 확인해 주세요.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })()
    );
    return;
  }

  // Precached static assets (icons, manifest): cache-first.
  if (PRECACHE_URLS.includes(url.pathname) && url.pathname !== OFFLINE_URL) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_VERSION);
        const hit = await cache.match(url.pathname);
        if (hit) return hit;
        return fetch(req);
      })()
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {
    title: "별빛 타로",
    body: "오늘의 운세가 준비됐어요.",
    url: "/today",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch (__) {
      /* keep defaults */
    }
  }
  const options = {
    body: data.body || "오늘의 운세가 준비됐어요.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/today" },
    lang: "ko",
    vibrate: [80, 40, 80],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "별빛 타로", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/today";
  const abs = new URL(target, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client && client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(abs);
              return;
            } catch (_) {
              /* fall through */
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(abs);
      }
    })()
  );
});
