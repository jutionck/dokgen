const CACHE_NAME = "dokgen-static-v2";
const PRECACHE = ["/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];
const STATIC_RE = /\/_next\/static\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Halaman, API, Server Components, dan data sesi harus selalu ditangani
  // langsung oleh browser/Next.js agar tidak pernah tersimpan di Cache Storage.
  const isStaticAsset =
    STATIC_RE.test(url.pathname) ||
    url.pathname === "/icon.svg" ||
    url.pathname.startsWith("/icons/");
  if (!isStaticAsset) return;

  // Hanya aset statis publik/immutable yang menggunakan cache-first.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
