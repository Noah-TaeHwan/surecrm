import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing';
import { 
  NetworkFirst, 
  CacheFirst, 
  StaleWhileRevalidate, 
  NetworkOnly,
  Strategy
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';

// TypeScript declarations
declare const self: ServiceWorkerGlobalScope;

// Global configuration for SureCRM caching
const CACHE_CONFIG = {
  maxEntries: {
    api: 100,        // API 응답 캐시 최대 100개
    static: 50,      // 정적 자원 최대 50개
    fonts: 10,       // 폰트 최대 10개
    images: 30       // 이미지 최대 30개
  },
  maxAge: {
    api: 30 * 60,           // API 캐시 30분
    static: 365 * 24 * 60 * 60,  // 정적 자원 1년
    fonts: 365 * 24 * 60 * 60,   // 폰트 1년
    images: 30 * 24 * 60 * 60    // 이미지 30일
  }
};

// Background sync queue for failed requests
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // 24시간 동안 재시도
});

// Precache all resources
precacheAndRoute([
  {
    url: '/manifest.json',
    revision: null,
  },
  {
    url: '/offline.html',
    revision: null,
  },
],);

// Register default handler for navigation requests
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    {
      denylist: [
        /^\/__/,
        /^\/api\//,
        /^\/auth\//,
      ],
    },
  ),
);

// Cache first strategy for API responses
registerRoute(
  ({ request, url }) => {
    return (
      url.origin === 'https://paxfweyoicnmshhdltef.supabase.co' &&
      (request.method === 'GET' || request.method === 'POST')
    );
  },
  async ({ request, event }) => {
    try {
      // Try network first
      const response = await fetch(request);
      
      if (response.ok) {
        // Cache successful responses
        const cache = await caches.open('supabase-api-v1');
        cache.put(request.url, response.clone());
      }
      
      return response;
    } catch (error) {
      // Fall back to cache
      const cache = await caches.open('supabase-api-v1');
      const cachedResponse = await cache.match(request.url);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline response for failed requests
      return new Response(
        JSON.stringify({
          error: 'Network unavailable',
          message: 'This request is not available offline',
          offline: true,
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },
);

// Handle document requests with offline fallback
setCatchHandler(async ({ request }) => {
  const destination = request.destination;
  
  if (destination === 'document') {
    // Serve offline page for document requests
    const cache = await caches.open('offline-v1');
    let cachedResponse = await cache.match('/offline.html');
    
    if (!cachedResponse) {
      // Cache offline.html if not already cached
      cachedResponse = await fetch('/offline.html');
      cache.put('/offline.html', cachedResponse.clone());
    }
    
    return new Response(cachedResponse.body, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  
  // Handle other requests
  const cache = await caches.open('runtime-cache-v1');
  const cachedResponse = await cache.match(request.url);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return generic offline response for other requests
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline',
      timestamp: Date.now(),
      offline: true,
      headers: {
        'X-Background-Sync': 'queued',
      },
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    },
  );
});

// Set default handler for all other requests
setDefaultHandler(async ({ request }) => {
  const cache = await caches.open('runtime-cache-v1');
  const cached = await cache.match(request.url);
  
  if (cached) {
    return cached;
  }
  
  try {
    return await fetch(request);
  } catch {
    // If both cache and network fail, return a generic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
});

// Offline data storage helpers (not currently used but available for future use)
const OFFLINE_STORAGE_KEY = 'offline-data-v1';

async function _storeOfflineData(key: string, data: unknown): Promise<void> {
  const cache = await caches.open(OFFLINE_STORAGE_KEY);
  await cache.put(
    key,
    new Response(
      JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  );
}

async function _getOfflineData(key: string): Promise<unknown | null> {
  try {
    const cache = await caches.open(OFFLINE_STORAGE_KEY);
    const response = await cache.match(key);
    
    if (response) {
      const data = await response.json();
      return data.data;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync(): Promise<void> {
  try {
    const cache = await caches.open('offline-queue-v1');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch {
        // Keep failed requests in queue for next sync
      }
    }
  } catch {
    // Background sync failed
  }
}

// Storage quota management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_STORAGE_ESTIMATE') {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          event.ports[0].postMessage({
            quota: estimate.quota,
            usage: estimate.usage,
          });
        })
        .catch(() => {
          event.ports[0].postMessage({
            quota: 0,
            usage: 0,
          });
        });
    } else {
      event.ports[0].postMessage({
        quota: 0,
        usage: 0,
      });
    }
  }
});

// Cache cleanup on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('old-cache-');
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
});

// Skip waiting and claim clients
self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  self.clients.claim();
});

// Service worker loaded message
console.log(
  '🚀 [SW] SureCRM Service Worker loaded with advanced caching strategies',
); 