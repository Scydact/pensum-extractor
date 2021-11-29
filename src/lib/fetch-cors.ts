
/** List of CORS proxies.
 * This allows this thing to run without backend. */
// TODO: Add more? https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
export const CORS_PROXIES = [
  '',                                       // no proxy
  'https://api.allorigins.win/raw?url=',
  'https://yacdn.org/serve/',
  'https://cors-anywhere.herokuapp.com/',   // has request limit (200 per hour)
  'https://crossorigin.me/',
  'https://cors-proxy.htmldriven.com/?url=',// Fails with CORS (what!?)
  'https://thingproxy.freeboard.io/fetch/', // problems with https requests
  'http://www.whateverorigin.org/get?url=', // problems with https requests, deprecated?
];

type RequestCallback = (
  state: 'attempt' | 'request' | 'success' | 'error',
  proxy: string,
  proxyId: number,
) => any;

/**
 *
 * @param {String} url address for the HTML to fetch
 * @param {String} cacheOpt cache policy, defaults to force-cache,
 * but if cache must be reloaded, do 'relaod'.
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
 * @return {String} the resulting HTML string fragment
 */
export default async function fetchCORS(
  /** URL to request */
  url: string,
  /** Fetch option headers of the request */
  opts: RequestInit = {},
  /** */
  currentProxyCallback?: RequestCallback,
  /** Proxy to use, if any. 
   * Can be a URL or an index to CORS_PROXIES.
   * @example
   * ['https://api.allorigins.win/raw?url='] // use allorigins.win
   * [''] // Use no proxy
   * ['', 'https://api.allorigins.win/raw?url='] // Check for no proxy first, then allorigins.
   */
  proxies = CORS_PROXIES
) {
  /** Current proxy ID */
  let currentProxyIdx = 0;
  while (currentProxyIdx < proxies.length) {

    // Get current proxy
    const proxy = proxies[currentProxyIdx];
    
    const startTime = new Date().getTime();
    const currUrl = proxy + url;

    /* Controller to cancel the fetch after a timeout. */
    const controller = new AbortController();
    const signal = controller.signal;
    opts.signal = signal;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn('Timed out!');
    }, 4e3);

    // 
    try {
      if (currentProxyCallback)
        currentProxyCallback('attempt', proxy, currentProxyIdx);

      var response = await fetch(currUrl, opts);

      if (currentProxyCallback)
        currentProxyCallback('request', proxy, currentProxyIdx);

      clearTimeout(timeoutId);
      if (response.ok) {
        const stopTime = new Date().getTime();
        console.info(`CORS proxy '${currUrl}' succeeded in ${stopTime - startTime} ms.'`);

        if (currentProxyCallback)
          currentProxyCallback('success', proxy, currentProxyIdx);

        return await response.text();
      } else {
        throw new Error('Response was not OK!');
      }
    } 
    
    catch (err) {
      clearTimeout(timeoutId);
      const stopTime = new Date().getTime();
      console.warn(`CORS proxy '${proxy}' failed in ${stopTime - startTime}ms.'`);
      console.warn(err);

      if (currentProxyCallback)
        currentProxyCallback('error', proxy, currentProxyIdx);
    } 
    
    finally {
      ++currentProxyIdx;
    }
  }
  return null;
}