/**
 * Auto-Update Service Worker
 * Handles offline-first caching, background sync, and delta updates
 * 
 * @version 2.2.0
 * @license MIT
 */

const CACHE_VERSION = 'auto-update-v2.2.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DELTA_CACHE_NAME = `${CACHE_VERSION}-delta`;
const RUNTIME_CACHE_NAME = `${CACHE_VERSION}-runtime`;

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/auto-update.js'
];

// Maximum cache size (in items)
const MAX_CACHE_SIZE = 100;

// Maximum cache age (in milliseconds)
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Install event - precache essential files
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versions
              return cacheName.startsWith('auto-update-') && 
                     cacheName !== CACHE_NAME &&
                     cacheName !== DELTA_CACHE_NAME &&
                     cacheName !== RUNTIME_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch event - implement offline-first strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle version manifest specially (always network first)
  if (url.pathname.includes('version-manifest.json')) {
    event.respondWith(handleManifestRequest(request));
    return;
  }
  
  // Handle API requests (network first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Handle static assets (cache first with network fallback)
  event.respondWith(cacheFirst(request));
});

/**
 * Handle manifest requests - always fetch fresh, but cache for offline
 */
async function handleManifestRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the manifest for offline use
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Manifest fetch failed, trying cache');
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Offline and no cached manifest' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first strategy with network fallback
 */
async function cacheFirst(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cache is stale
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now - cacheDate;
    
    if (age < MAX_CACHE_AGE) {
      console.log('[SW] Serving from cache:', request.url);
      
      // Update cache in background
      updateCacheInBackground(request);
      
      return cachedResponse;
    }
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Trim cache if needed
      trimCache(CACHE_NAME, MAX_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, using stale cache:', request.url);
    
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network-first strategy with cache fallback
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Update cache in background (stale-while-revalidate)
 */
function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    })
    .catch(() => {
      // Ignore errors in background update
    });
}

/**
 * Trim cache to maximum size
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest items
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Trimmed ${itemsToDelete} items from ${cacheName}`);
  }
}

/**
 * Background sync event - sync updates when online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdatesInBackground());
  }
  
  if (event.tag === 'download-delta') {
    event.waitUntil(downloadDeltaUpdates());
  }
});

/**
 * Check for updates in background
 */
async function checkForUpdatesInBackground() {
  try {
    console.log('[SW] Checking for updates in background...');
    
    const response = await fetch('/version-manifest.json?_bg=1');
    if (!response.ok) {
      throw new Error('Failed to fetch manifest');
    }
    
    const manifest = await response.json();
    
    // Notify all clients about the update
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: manifest.version,
        manifest: manifest
      });
    });
    
    console.log('[SW] Update check complete:', manifest.version);
  } catch (error) {
    console.error('[SW] Background update check failed:', error);
  }
}

/**
 * Download delta updates (only changed files)
 */
async function downloadDeltaUpdates() {
  try {
    console.log('[SW] Downloading delta updates...');
    
    // Get current manifest from cache
    const cachedManifest = await caches.match('/version-manifest.json');
    if (!cachedManifest) {
      console.log('[SW] No cached manifest, skipping delta update');
      return;
    }
    
    const oldManifest = await cachedManifest.json();
    
    // Get new manifest
    const newManifestResponse = await fetch('/version-manifest.json?_delta=1');
    const newManifest = await newManifestResponse.json();
    
    // Compare file hashes to find changed files
    const changedFiles = [];
    const oldFiles = oldManifest.files || {};
    const newFiles = newManifest.files || {};
    
    for (const [filename, hash] of Object.entries(newFiles)) {
      if (oldFiles[filename] !== hash) {
        changedFiles.push(filename);
      }
    }
    
    console.log('[SW] Changed files:', changedFiles);
    
    // Download only changed files
    const cache = await caches.open(DELTA_CACHE_NAME);
    
    for (const filename of changedFiles) {
      try {
        const response = await fetch(`/${filename}`);
        if (response.ok) {
          await cache.put(`/${filename}`, response);
          console.log('[SW] Downloaded:', filename);
        }
      } catch (error) {
        console.error('[SW] Failed to download:', filename, error);
      }
    }
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'DELTA_UPDATE_COMPLETE',
        changedFiles: changedFiles,
        version: newManifest.version
      });
    });
    
    console.log('[SW] Delta update complete');
  } catch (error) {
    console.error('[SW] Delta update failed:', error);
  }
}

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
      
    case 'CHECK_UPDATES':
      event.waitUntil(checkForUpdatesInBackground());
      break;
      
    case 'DOWNLOAD_DELTA':
      event.waitUntil(downloadDeltaUpdates());
      break;
      
    case 'PRECACHE_URLS':
      if (data && data.urls) {
        event.waitUntil(precacheUrls(data.urls));
      }
      break;
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

/**
 * Precache specific URLs
 */
async function precacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
  console.log('[SW] Precached URLs:', urls);
}

/**
 * Push event - handle push notifications for updates
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = { title: 'Update Available', body: 'A new version is available' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'auto-update',
      requireInteraction: true,
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    })
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'update') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Focus existing window or open new one
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].postMessage({ type: 'APPLY_UPDATE' });
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
});

console.log('[SW] Service worker script loaded');
