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
    console.log('[Service Worker] ' + e.request.url);
    e.respondWith(
        // (async () => {
        //     let cachePromise = caches.match(e.request);

        //     try {
        //         let fetchPromise = fetch(e.request);
        //         let fetchResponse = await fetchPromise;
        //         return caches.open('pensum-extractor').then(function (cache) {
        //             console.log('[Service Worker] ' + 'Cache updated for ' + e.request.url);
        //             return cache.put(e.request, fetchResponse.clone())

        //             // todo: sort out the auto update thing
        //         });
        //     } 
        //     catch(error) {
        //         return cachePromise;
        //     }

        //     console.log(cacheResponse);
        //     if (fetchResponse.ok) {
        //         return fetchPromise;
        //     } else {
        //         return cachePromise;
        //     }
        //     //return fetchPromise;//.catch(caches.match(e.request))
        //     // caches.match(e.request).then(function (response) {
        //     //     return response || fetch(e.request);
        //     // })
        // })()
        fetch(e.request).catch(() => caches.match(e.request))
    );
});