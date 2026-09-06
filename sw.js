// Service Worker for caching assets
const CACHE_NAME = "farming-game-v7-" + Date.now();
const CRITICAL_ASSETS = [
  "./",
  "./index.html",
  "./src/main.js",
  "./assets/introbg.jpg",
  "./assets/farmerr.png",
  "./assets/click.mp3",
  "./assets/sound/main_soundtrack.mp3",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching critical assets...");
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log("Found caches:", cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("Deleting cache:", cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log("All caches cleared, claiming clients...");
        return self.clients.claim();
      })
      .then(() => {
        console.log("Service Worker activated successfully");
        // Force reload all clients to get fresh content
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "FORCE_RELOAD" });
          });
        });
      })
  );
});

// Fetch event - always fetch from network for JavaScript files
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For JavaScript files, always fetch from network to get latest version
  if (event.request.url.includes(".js")) {
    console.log("Force fetching JS from network:", event.request.url);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            // Cache the new version
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other files, use normal cache strategy
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log("Serving from cache:", event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log("Fetching from network:", event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      })
  );
});

// Message event for cache management
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
