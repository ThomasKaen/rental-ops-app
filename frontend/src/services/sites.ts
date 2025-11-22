// src/services/sites.ts
import api from "../lib/api";

export interface Site {
  id: number;
  name: string;
  address: string;
  notes?: string | null;
}

export async function listSites(): Promise<Site[]> {
  return api.get<Site[]>("sites");
}

export async function getSite(id: number): Promise<Site> {
  return api.get<Site>(`sites/${id}`);
}

export async function createSite(input: {
  name: string;
  address?: string;
}): Promise<Site> {
  return api.post<Site>("sites", input);
}

export async function deleteSite(id: number): Promise<void> {
  await api.delete(`sites/${id}`);
}
