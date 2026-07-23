const CACHE_NAME = 'amac-gov-cache-v1';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle local GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for pages/assets
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback response for offline routes
          return new Response(
            `<html>
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>AMAC - Mode Hors-ligne</title>
                <style>
                  body { font-family: sans-serif; text-align: center; padding: 40px; color: #1c1c1e; background: #fcfcfc; }
                  h1 { color: #E8730C; }
                  p { color: #555; }
                </style>
              </head>
              <body>
                <h1>⚠️ Mode Hors-ligne</h1>
                <p>Cette page n'est pas encore mise en cache. Veuillez vous reconnecter à Internet pour y accéder.</p>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
      })
  );
});
