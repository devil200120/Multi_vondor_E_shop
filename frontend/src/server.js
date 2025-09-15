// Use localhost for development, production URL for deployment
const isDevelopment = process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost';

export const server = isDevelopment 
  ? "http://localhost:8000/api/v2" 
  : "https://multi-vondor-e-shop.onrender.com/api/v2";

export const backend_url = isDevelopment 
  ? "http://localhost:8000/" 
  : "https://multi-vondor-e-shop.onrender.com/";