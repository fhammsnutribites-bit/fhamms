// API Configuration for Vite
// In production (Vercel), API routes are on the same domain
// In development, use localhost or VITE_API_URL if set
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Vercel), use relative URL for same-domain API
  if (import.meta.env.PROD) {
    return '';
  }
  
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();


