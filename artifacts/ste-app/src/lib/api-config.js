// api-config.js - Memaksa semua API ke backend

// Ganti dengan alamat backend kamu
const BACKEND_URL = 'http://localhost:8080';

// Simpan URL asli
const originalFetch = window.fetch;

// Override fetch
window.fetch = function(url, options) {
  // Jika URL mulai dengan /api, arahkan ke backend
  if (typeof url === 'string' && url.startsWith('/api')) {
    const newUrl = BACKEND_URL + url;
    console.log('🔄 Redirect API:', url, '→', newUrl);
    return originalFetch(newUrl, options);
  }
  return originalFetch(url, options);
};

console.log('✅ API redirect aktif. Backend:', BACKEND_URL);