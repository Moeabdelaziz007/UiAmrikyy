const CACHE_NAME = 'amrikyy-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event: cache the application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network.
self.addEventListener('fetch', event => {
    // Always go to the network for Gemini API calls
    if (event.request.url.includes('generativelanguage.googleapis.com')) {
        // Respond with a fetch request.
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Not in cache - fetch from network, cache, and return
            return fetch(event.request).then(
                networkResponse => {
                    // Check if we received a valid response
                    if(!networkResponse || networkResponse.status !== 200) {
                         if(networkResponse.type !== 'opaque' && networkResponse.status !== 0) {
                            return networkResponse;
                         }
                    }

                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Only cache GET requests
                            if (event.request.method === 'GET') {
                                cache.put(event.request, responseToCache);
                            }
                        });

                    return networkResponse;
                }
            ).catch(error => {
                console.error('Fetch failed:', error);
                throw error;
            });
        })
    );
});