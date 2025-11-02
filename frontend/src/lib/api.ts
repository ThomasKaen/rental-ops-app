import axios from "axios";

const vite = (import.meta as any).env?.VITE_API_URL;
const runtime = (window as any).__CONFIG__?.API_URL;
const fallback = `${location.protocol}//${location.hostname}:8000`;

// prefer build-time var, then runtime, then fallback
const baseURL = (vite || runtime || fallback).replace(/\/+$/, "");
console.log("[API baseURL]", baseURL);

const api = axios.create({ baseURL });
export default api;