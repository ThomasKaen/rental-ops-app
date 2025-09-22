import axios from "axios";

/** Robust base URL detection */
const runtime = (window as any).__CONFIG__?.API_URL;
const vite = (import.meta as any).env?.VITE_API_URL;
const fallback = `${location.protocol}//${location.hostname}:8000`;

const baseURL = (runtime || vite || fallback).replace(/\/+$/, "");
console.log("[API baseURL]", baseURL);

const api = axios.create({ baseURL });
export default api;
