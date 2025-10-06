// Minimal secure service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// No caching or network requests to prevent SSRF vulnerabilities