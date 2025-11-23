// src/services/units.ts
import api from "../lib/api";

export type Site = { id: number; name: string };

export async function listSites(): Promise<Site[]> {
  const res = await api.get<Site[]>("/sites/");
  return res.data;
}

export type Unit = {
  id: number;
  site_id: number;
  name: string;
  notes?: string | null;
};

export async function listUnitsForSite(siteId: number): Promise<Unit[]> {
  const res = await api.get<Unit[]>(`/sites/${siteId}/units/`);
  return res.data;
}

export async function createUnit(
  siteId: number,
  payload: Omit<Unit, "id" | "site_id">
): Promise<Unit> {
  const res = await api.post<Unit>(`/sites/${siteId}/units/`, payload);
  return res.data;
}

export async function updateUnit(
  id: number,
  payload: Partial<Omit<Unit, "id" | "site_id">>
): Promise<Unit> {
  const res = await api.put<Unit>(`/units/${id}`, payload);
  return res.data;
}

export async function deleteUnit(id: number): Promise<void> {
  await api.delete(`/units/${id}`);
}
