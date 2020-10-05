self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('pensum-extractor').then(function (cache) {
            return cache.addAll([
                './',
                './index.html',
                './styles.css',

                './awesomplete.css',
                './awesomplete.min.js',
                './xlsx.full.min.js',
                './FileSaver.min.js',

                './build/main.js',
                './carreras.json',
                
                './ignoredMats.json'
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});