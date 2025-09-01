import axios from "axios";

let apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Ensure HTTPS in production
if (import.meta.env.PROD && apiBaseUrl.startsWith('http:')) {
  apiBaseUrl = apiBaseUrl.replace('http:', 'https:');
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: false,
});
