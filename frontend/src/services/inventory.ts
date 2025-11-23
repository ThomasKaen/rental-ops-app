// src/services/inventory.ts
import api from "../lib/api";

export type Item = {
  id: number;
  sku: string;
  name: string;
  category?: string | null;
  uom: string;
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

export type MovementReason =
  | "usage"
  | "delivery"
  | "adjustment"
  | "transfer";

// -------- Items --------

export async function listItems(): Promise<Item[]> {
  const res = await api.get<Item[]>("/inventory/items");
  return res.data;
}

export async function createItem(payload: Omit<Item, "id">): Promise<Item> {
  const res = await api.post<Item>("/inventory/items", payload);
  return res.data;
}

export async function updateItem(
  id: number,
  payload: Partial<Omit<Item, "id">>
): Promise<Item> {
  const res = await api.put<Item>(`/inventory/items/${id}`, payload);
  return res.data;
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/inventory/items/${id}`);
}

// -------- Sites --------

export type SiteRef = { id: number; name: string };

export async function listInventorySites(): Promise<SiteRef[]> {
  const res = await api.get<SiteRef[]>("/sites/");
  return res.data;
}

// -------- Stock --------

export async function getStockForSite(siteId: number): Promise<Stock[]> {
  const res = await api.get<Stock[]>(`/inventory/stock?site_id=${siteId}`);
  return res.data;
}

export async function upsertStock(
  siteId: number,
  itemId: number,
  qty: number
): Promise<void> {
  await api.post("/inventory/stock/upsert", {
    site_id: siteId,
    item_id: itemId,
    quantity: qty,
  });
}

export async function moveStock(
  stockId: number,
  delta: number,
  reason: MovementReason,
  reference: string
): Promise<void> {
  await api.post(`/inventory/stock/${stockId}/move`, {
    delta,
    reason,
    reference,
    author: "web",
  });
}
