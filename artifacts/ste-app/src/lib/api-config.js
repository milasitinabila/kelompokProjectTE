// API Base URL - otomatis berubah sesuai environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('🌐 API Base URL:', API_BASE_URL);

// Override fetch global
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const newUrl = API_BASE_URL + url;
    console.log('🔄 Redirect:', url, '→', newUrl);
    return originalFetch(newUrl, options);
  }
  return originalFetch(url, options);
};

export { API_BASE_URL };