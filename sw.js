// Service worker: guarda la app en caché para que funcione sin conexión.
// Estrategia: se sirve al instante lo guardado y se renueva en segundo plano; la versión nueva
// se ve en la siguiente apertura. Si se añade o quita un archivo de la app, actualiza ARCHIVOS.
const PREFIJO = 'mis-pagos-';
const VERSION = `${PREFIJO}cache-1`;
const ARCHIVOS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'formato.js',
  'calculos.js',
  'almacen.js',
  'ui/util.js',
  'ui/movimiento.js',
  'ui/pagos.js',
  'ui/resumen.js',
  'ui/calendario.js',
  'ui/ajustes.js',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (evento) => {
  // cache: 'reload' evita guardar archivos viejos de la caché HTTP del navegador.
  const peticiones = ARCHIVOS.map((u) => new Request(new URL(u, self.registration.scope), { cache: 'reload' }));
  evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(peticiones)));
  self.skipWaiting();
});

// Solo borra cachés antiguas de esta app: en GitHub Pages el origen se comparte con otros proyectos.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((c) => c.startsWith(PREFIJO) && c !== VERSION).map((c) => caches.delete(c)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;
  if (new URL(peticion.url).origin !== new URL(self.registration.scope).origin) return;

  evento.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const guardado = await cache.match(peticion);
    const red = fetch(peticion, { cache: 'reload' }).then(async (respuesta) => {
      if (respuesta.ok) await cache.put(peticion, respuesta.clone());
      return respuesta;
    });
    if (guardado) {
      evento.waitUntil(red.catch(() => { /* sin conexión: se queda lo guardado */ }));
      return guardado;
    }
    return red;
  })());
});
