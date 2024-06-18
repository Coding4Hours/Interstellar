importScripts("/assets/-dy/config.js?v=6-17-2024")
importScripts("/assets/-dy/worker.js?v=6-17-2024")
importScripts("/assets/-uv/bundle.js?v=6-17-2024")
importScripts("/assets/-uv/config.js?v=6-17-2024")
importScripts(__uv$config.sw || "/assets/-uv/sw.js?v=6-17-2024")

const uv = new UVServiceWorker()
const dynamic = new Dynamic()

const userKey = new URL(location).searchParams.get("userkey")
self.dynamic = dynamic


const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/index.html';
const ASSETS = [
    '/',
    '/index.html',
    '/assets/js/index.js',
    '/assets/-dy/client.js',
    '/assets/-dy/config.js',
    '/assets/-dy/handler.js',
    '/assets/-dy/html.js',
    '/assets/-dy/worker.js',
    '/assets/-uv/bundle.js',
    '/assets/-uv/config.js',
    '/assets/-uv/handler.js',
    '/assets/-uv/sw.js',
    '/sw.js',
];

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (await dynamic.route(event)) {
        return await dynamic.fetch(event)
      }

      if (event.request.url.startsWith(`${location.origin}/a/`)) {
        return await uv.fetch(event)
      }

      return await fetch(event.request)
    })()
  )
})

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            }).catch(() => {
                return caches.match(OFFLINE_URL);
            })
    );
});
