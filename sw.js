const CACHE_NAME = 'spectral-blackjack-v11';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/responsive.css',
    '/js/core/Card.js',
    '/js/core/Deck.js',
    '/js/core/Hand.js',
    '/js/core/GameManager.js',
    '/js/systems/EconomyManager.js',
    '/js/systems/AudioManager.js',
    '/js/systems/AchievementManager.js',
    '/js/systems/DailyBonusManager.js',
    '/js/systems/StatsManager.js',
    '/js/systems/QuestManager.js',
    '/js/systems/WheelManager.js',
    '/js/systems/ThemeManager.js',
    '/js/systems/AvatarManager.js',
    '/js/systems/HistoryManager.js',
    '/js/systems/GestureManager.js',
    '/js/systems/HapticManager.js',
    '/js/systems/NotificationManager.js',
    '/js/systems/AnimationManager.js',
    '/js/systems/EffectsManager.js',
    '/js/systems/ShopManager.js',
    '/js/systems/AdSystem.js',
    '/js/systems/IAPSystem.js',
    '/js/main.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('[SW] Cache failed:', err);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-success responses
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed, return offline fallback if available
                        return caches.match('/index.html');
                    });
            })
    );
});

// Listen for skip waiting message
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
