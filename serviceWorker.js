// Taken from https://serviceworke.rs/strategy-network-or-cache_service-worker_doc.html
var CACHE = 'pensum-extractor';

self.addEventListener('install', function (evt) {
    console.log('Service worker installed...');
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    evt.respondWith(networkFirst(evt.request));
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            './',
            './index.html',
            './styles.css',

            './lib/awesomplete.css',
            './lib/awesomplete.min.js',
            './lib/xlsx.full.min.js',
            './lib/FileSaver.min.js',
            './lib/blob-stream.js',

            './lib/pdf.min.js',
            './lib/pdf.worker.min.js',
            './lib/pdfkit.standalone.js',

            './lib/basic-primitives/primitives.js',
            './lib/basic-primitives/css/primitives.css',

            './build/main.js',
        ])
    })
}

async function networkFirst(req) {
    const cache = await caches.open(CACHE);
    try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
    } catch (e) {
        const cachedResponse = await cache.match(req);
        return cachedResponse;
    }
}