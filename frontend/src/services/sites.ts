// src/services/sites.ts
import api from "../lib/api";

export type Site = {
  id: number;
  name: string;
  address?: string | null;
  notes?: string | null;
  units?: number | null; // used on Sites list + detail
};

export type SiteCreate = {
  name: string;
  address?: string | null;
  notes?: string | null;
  units?: number | null;
};

export type SiteUpdate = Partial<SiteCreate>;

// ---- list + detail ----

export async function listSites(): Promise<Site[]> {
  const res = await api.get<Site[]>("/sites");
  return res.data;
}

export async function getSite(id: number): Promise<Site> {
  const res = await api.get<Site>(`/sites/${id}`);
  return res.data;
}

// ---- mutations ----

export async function createSite(data: SiteCreate): Promise<Site> {
  const res = await api.post<Site>("/sites", data);
  return res.data;
}

export async function updateSite(
  id: number,
  data: SiteUpdate
): Promise<Site> {
  const res = await api.put<Site>(`/sites/${id}`, data);
  return res.data;
}

export async function deleteSite(id: number): Promise<void> {
  await api.delete(`/sites/${id}`);
}
