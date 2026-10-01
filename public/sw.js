/* 별빛 타로 — Web Push service worker */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
