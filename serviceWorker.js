// Taken from https://serviceworke.rs/strategy-network-or-cache_service-worker_doc.html
var CACHE = 'pensum-extractor';

self.addEventListener('install', function (evt) {
    console.log('Service worker installed...');
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    evt.respondWith(fromNetwork(evt.request, 1e3)
        .catch(function () {
            return fromCache(evt.request)
        }));
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
            './carreras.json',

            './ignoredMats.json'
        ])
    })
}

function fromNetwork(request, timeout) {
    return new Promise(function (fulfill, reject) {
        var timeoutId = setTimeout(reject, timeout);
        fetch(request).then(function (response) {
            clearTimeout(timeoutId);
            console.log('SUCCESS');
            console.log(response.status);
            fulfill(response);
        }, reject);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}