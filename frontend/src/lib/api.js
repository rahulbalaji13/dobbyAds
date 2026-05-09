import axios from 'axios';

const normalize = (value) => (value || '').replace(/\/$/, '');

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const envBase = normalize(import.meta.env.VITE_API_BASE_URL);

const inferredBase = runtimeOrigin.includes('localhost')
  ? 'http://localhost:5000'
  : 'https://dobbyads.onrender.com';

export const API_BASE_URL = envBase || inferredBase;

export const api = axios.create({
  baseURL: API_BASE_URL,
});
