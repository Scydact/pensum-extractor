import { Workbox } from 'workbox-window';

// TODO: If update available, prompt user to refresh.
export default function registerServiceWorker() {
  const isProduction = process.env.NODE_ENV === 'production';
  const canServiceWorker = 'serviceWorker' in navigator
  if (isProduction && canServiceWorker ) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    const wb = new Workbox('sw.js'); // this name was set on config-override.js

    wb.addEventListener('installed', event => {
      /**
       * We have the condition — event.isUpdate because we don’t want to show
       * this message on the very first service worker installation,
       * only on the updated
       */
      if (event.isUpdate) {
        console.log('New update available!');
      }
    });
    wb.register();
  }
}