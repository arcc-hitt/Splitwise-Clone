import axios from "axios";

const apiBaseUrl = import.meta.env.PROD 
  ? "https://worldwide-alisa-archit-mahule-b4ac4f60.koyeb.app"
  : "http://localhost:8000";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: false,
});
