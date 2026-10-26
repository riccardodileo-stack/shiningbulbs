/* App online: non memorizza né intercetta dati, password o risposte API.
   L'installazione come web app usa il manifest; la rete resta necessaria. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
