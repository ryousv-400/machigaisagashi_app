// Service Worker - Cache First Strategy
const CACHE_NAME = 'machigaisagashi-v4';

// プリキャッシュするファイル一覧
const PRECACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './manifest.json',
    './assets/qrcode.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    // ステージ画像（30ステージ × 左右2枚 = 60枚）
    ...Array.from({ length: 30 }, (_, i) => {
        const n = i + 1;
        return [
            `./assets/stage${n}_left.png`,
            `./assets/stage${n}_right.png`
        ];
    }).flat()
];

// インストール時：全ファイルをプリキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// フェッチ時：Cache First（キャッシュ優先、なければネットワーク）
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // 成功したレスポンスをキャッシュに追加
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // オフラインでキャッシュにもない場合のフォールバック
            if (event.request.destination === 'document') {
                return caches.match('./index.html');
            }
        })
    );
});
