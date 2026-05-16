/* coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT
   Hosted locally for same-origin service worker registration on GitHub Pages */
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  async function handleFetch(event) {
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
      return;
    }
    const r = await fetch(event.request).catch(e => console.error(e));
    if (!r) return;
    const headers = new Headers(r.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
  }

  self.addEventListener('fetch', (event) => event.respondWith(handleFetch(event)));
} else {
  (async function () {
    if (window.crossOriginIsolated !== false) return;

    const registration = await navigator.serviceWorker
      .register(window.document.currentScript.src)
      .catch(e => console.error('COOP/COEP Service Worker failed to register:', e));

    if (registration) {
      console.log('COOP/COEP Service Worker registered, reloading..');
      window.location.reload();
    }
  })();
}
