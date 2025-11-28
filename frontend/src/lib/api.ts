// src/lib/api.ts
import axios, { AxiosRequestConfig } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

function cleanPath(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.get<T>(cleanPath(path), config);
  return res.data;
}

async function post<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.post<T>(cleanPath(path), body, config);
  return res.data;
}

async function put<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.put<T>(cleanPath(path), body, config);
  return res.data;
}

async function patch<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.patch<T>(cleanPath(path), body, config);
  return res.data;
}

async function del<T = void>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.delete<T>(cleanPath(path), config);
  return res.data;
}

const api = { get, post, put, patch, delete: del };

export default api;
