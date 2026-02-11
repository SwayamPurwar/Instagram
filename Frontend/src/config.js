// Frontend/src/config.js
const config = {
  // Use Vite's env variable feature. 
  // In dev, it falls back to localhost. In prod, set VITE_API_URL in your host.
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000"
};

export default config;