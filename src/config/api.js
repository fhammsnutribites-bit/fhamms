// API Configuration for Vite
// When frontend and backend are deployed separately, use VITE_API_URL environment variable
// In development, use localhost
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set (required for separate deployments), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();


