// src/services/inventory.ts
import api from "../lib/api";

export type Item = {
  id: number;
  sku: string;
  name: string;
  uom: string;
  category?: string | null;
  notes?: string | null;
};

export type Stock = {
  id: number;
  site_id: number;
  item_id: number;
  quantity: number;
  min_level_override?: number | null;
  updated_at: string;
};

export type MovementReason = "usage" | "delivery" | "adjustment" | "transfer";

// --- Items ---
export async function listItems(): Promise<Item[]> {
  return api.get<Item[]>("inventory/items");
}

export async function createItem(data: Partial<Item>): Promise<Item> {
  return api.post<Item>("inventory/items", data);
}

export async function updateItem(id: number, data: Partial<Item>): Promise<Item> {
  return api.put<Item>(`inventory/items/${id}`, data);
}

export async function deleteItemById(id: number): Promise<void> {
  return api.delete(`inventory/items/${id}`);
}

// --- Stock ---
export async function listStockForSite(siteId: number): Promise<Stock[]> {
  return api.get<Stock[]>(`inventory/stock?site_id=${siteId}`);
}

export async function upsertStock(
  siteId: number,
  itemId: number,
  quantity: number
): Promise<void> {
  return api.post(`inventory/stock/upsert`, { site_id: siteId, item_id: itemId, quantity });
}

export async function moveStock(
  stockId: number,
  delta: number,
  reason: MovementReason,
  reference: string
): Promise<void> {
  return api.post(`inventory/stock/${stockId}/move`, {
    delta,
    reason,
    reference,
    author: "web",
  });
}
