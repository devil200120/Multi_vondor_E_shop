// Use localhost for development, VPS URL for production
const isDevelopment = process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost';

export const server = isDevelopment 
  ? "http://localhost:8000/api/v2" 
  : "https://samrudhigroup.in/api/v2";

export const backend_url = isDevelopment 
  ? "http://localhost:8000/" 
  : "https://samrudhigroup.in/";