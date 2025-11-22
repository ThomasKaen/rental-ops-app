// src/services/units.ts
import api from "../lib/api";

export interface Unit {
  id: number;
  site_id: number;
  name: string;
  notes?: string | null;
}

export async function listUnitsForSite(siteId: number): Promise<Unit[]> {
  return api.get<Unit[]>(`sites/${siteId}/units`);
}

export async function createUnit(
  siteId: number,
  data: { name: string; notes?: string | null }
): Promise<Unit> {
  return api.post<Unit>(`sites/${siteId}/units`, data);
}

export async function updateUnit(
  id: number,
  data: { name: string; notes?: string | null }
): Promise<Unit> {
  return api.put<Unit>(`units/${id}`, data);
}

export async function deleteUnit(id: number): Promise<void> {
  await api.delete(`units/${id}`);
}

export async function bulkCreateUnits(
  siteId: number,
  count: number
): Promise<Unit[]> {
  for (let i = 1; i <= count; i++) {
    await createUnit(siteId, { name: `Unit ${i}` });
  }
  return listUnitsForSite(siteId);
}
