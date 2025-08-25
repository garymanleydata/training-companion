
const VERSION = 'v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './lib.js',
  './app.js',
  './modules/runs.js',
  './modules/strength.js',
  './modules/fasting.js',
  './modules/meditation.js',
  './modules/parkrun.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k!==VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith((async ()=>{
    const cached = await caches.match(req);
    if(cached) return cached;
    try{
      const fresh = await fetch(req);
      const cache = await caches.open(VERSION);
      cache.put(req, fresh.clone());
      return fresh;
    }catch(err){
      return cached || Response.error();
    }
  })());
});
