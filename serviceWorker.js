self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('product-app-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './css/style.css',
        './js/app.js',
        './data/default-products.json',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
