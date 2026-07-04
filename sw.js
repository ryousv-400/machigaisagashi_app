// 旧版 PWA（ぷくぷく版）の Service Worker を置き換えて掃除するための自己消滅型 SW。
// 旧版が同じ URL (/sw.js) を登録していたため、このファイルが更新として取り込まれると
// 全キャッシュを削除 → 自分自身を登録解除 → 開いているページを再読み込みする。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
