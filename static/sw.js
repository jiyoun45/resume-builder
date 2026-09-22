const CACHE_NAME = 'resume-builder-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/icon.svg'
];

// 1. 서비스 워커 설치 시 핵심 정적 자원 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. 새로운 서비스 워커 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 네트워크 요청 가로채기 (Network First + Cache Fallback)
self.addEventListener('fetch', (event) => {
  // POST 요청(/generate 등)은 캐싱하지 않고 네트워크로 직접 전달
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 유효한 응답인 경우 캐시 업데이트
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 오프라인 상태이거나 네트워크 실패 시 캐시된 자원 반환
        return caches.match(event.request);
      })
  );
});
