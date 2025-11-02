import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

type Item = { id: number; sku: string; name: string; category?: string | null; uom: string; notes?: string | null };
type Stock = { id: number; site_id: number; item_id: number; quantity: number; min_level_override?: number | null; updated_at: string };
type MovementReason = "usage" | "delivery" | "adjustment" | "transfer";
type Site = { id: number; name: string };

export default function Inventory() {
  // items
  const [items, setItems] = useState<Item[]>([]);
  const [iq, setIq] = useState("");
  const filteredItems = useMemo(() => {
    const k = iq.trim().toLowerCase();
    if (!k) return items;
    return items.filter(i => i.name.toLowerCase().includes(k) || i.sku.toLowerCase().includes(k));
  }, [items, iq]);

  // sites
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");

  // stock
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // item edit modal
  const [editing, setEditing] = useState<Partial<Item> | null>(null);

  // movement modal
  const [moveFor, setMoveFor] = useState<Stock | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<MovementReason>("usage");
  const [reference, setReference] = useState<string>("");

  const loadItems = async () => {
    try { const r = await api.get("inventory/items"); setItems(r.data); }
    catch (e: any) { setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load items"); }
  };
  const loadSites = async () => {
    try { const r = await api.get("sites/"); setSites(r.data); } // NOTE: trailing slash
    catch { /* ignore */ }
  };
  const loadStock = async (sid: number) => {
    setLoading(true); setErr(null);
    try {
      const r = await api.get(`inventory/stock?site_id=${sid}`);
      setStock(r.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load stock");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadItems(); loadSites(); }, []);
  useEffect(() => { if (siteId) loadStock(siteId as number); }, [siteId]);

  // items CRUD
  const startNewItem = () => setEditing({ name: "", sku: "", uom: "pcs", category: "", notes: "" });
  const startEditItem = (it: Item) => setEditing({ ...it });

  const saveItem = async () => {
    if (!editing?.name?.trim() || !editing?.sku?.trim()) return;
    try {
      if (editing.id) {
        await api.put(`inventory/items/${editing.id}`, {
          name: editing.name, sku: editing.sku, uom: editing.uom,
          category: editing.category ?? null, notes: editing.notes ?? null
        });
      } else {
        await api.post(`inventory/items`, {
          name: editing.name, sku: editing.sku, uom: editing.uom,
          category: editing.category ?? null, notes: editing.notes ?? null
        });
      }
      setEditing(null);
      await loadItems();
      if (siteId) await loadStock(siteId as number);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to save item");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`inventory/items/${id}`);
    await loadItems();
    if (siteId) await loadStock(siteId as number);
  };

  // stock upsert
  const setQty = async (itemId: number, qty: number) => {
    if (!siteId) return;
    await api.post(`inventory/stock/upsert`, { site_id: siteId, item_id: itemId, quantity: qty });
    await loadStock(siteId as number);
  };

  // movement
  const openMove = (s: Stock) => { setMoveFor(s); setDelta(0); setReason("usage"); setReference(""); };
  const saveMove = async () => {
    if (!moveFor || !siteId || !delta) { setMoveFor(null); return; }
    await api.post(`inventory/stock/${moveFor.id}/move`, { delta, reason, reference, author: "web" });
    setMoveFor(null);
    await loadStock(siteId as number);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* Items */}
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input placeholder="Search items (name/sku)" value={iq} onChange={e => setIq(e.target.value)} />
          <button onClick={startNewItem}>+ New Item</button>
          {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 120px", padding: "6px 8px", background: "#f8fafc", borderBottom: "1px solid #eee", fontSize: 12, color: "#555" }}>
            <div>Name</div><div>SKU</div><div>UoM</div><div />
          </div>
          {filteredItems.map(it => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 120px", padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
              <div title={it.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
              <div>{it.sku}</div>
              <div>{it.uom}</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => startEditItem(it)}>Edit</button>
                <button onClick={() => deleteItem(it.id)} style={{ color: "#b91c1c" }}>Delete</button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <div style={{ padding: 8 }}>No items.</div>}
        </div>
      </div>

      {/* Stock */}
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <select value={String(siteId)} onChange={e => setSiteId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select site…</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {loading && <span>Loading…</span>}
        </div>

        {siteId ? (
          <div style={{ border: "1px solid #eee", borderRadius: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 180px 120px", padding: "6px 8px", background: "#f8fafc", borderBottom: "1px solid #eee", fontSize: 12, color: "#555" }}>
              <div>Item</div><div>Qty</div><div>Set Quantity</div><div />
            </div>
            {items.map(it => {
              const st = stock.find(s => s.item_id === it.id);
              return (
                <StockRow
                  key={it.id}
                  item={it}
                  stock={st}
                  onSaveQty={(qty) => setQty(it.id, qty)}
                  onMove={() => st && openMove(st)}
                />
              );
            })}
            {items.length === 0 && <div style={{ padding: 8 }}>No items to show.</div>}
          </div>
        ) : (
          <div style={{ color: "#555" }}>Choose a site to view/edit stock.</div>
        )}
      </div>

      {/* Item modal */}
      {editing && (
        <Modal title={editing.id ? "Edit Item" : "New Item"} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 8 }}>
            <input placeholder="Name" value={editing.name ?? ""} onChange={e => setEditing(s => ({ ...s!, name: e.target.value }))} />
            <input placeholder="SKU" value={editing.sku ?? ""} onChange={e => setEditing(s => ({ ...s!, sku: e.target.value }))} />
            <input placeholder="UoM" value={editing.uom ?? "pcs"} onChange={e => setEditing(s => ({ ...s!, uom: e.target.value }))} />
            <input placeholder="Category" value={editing.category ?? ""} onChange={e => setEditing(s => ({ ...s!, category: e.target.value }))} />
            <textarea placeholder="Notes" value={editing.notes ?? ""} onChange={e => setEditing(s => ({ ...s!, notes: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button onClick={() => setEditing(null)}>Cancel</button>
            <button onClick={saveItem} disabled={!editing.name?.trim() || !editing.sku?.trim()}>Save</button>
          </div>
        </Modal>
      )}

      {/* Movement modal */}
      {moveFor && (
        <Modal title="Move Stock" onClose={() => setMoveFor(null)}>
          <div style={{ display: "grid", gap: 8 }}>
            <div>Current qty: <b>{moveFor.quantity}</b></div>
            <input type="number" value={delta} onChange={e => setDelta(Number(e.target.value))} placeholder="Delta (e.g., -3 or 10)" />
            <select value={reason} onChange={e => setReason(e.target.value as MovementReason)}>
              <option value="usage">Usage (-)</option>
              <option value="delivery">Delivery (+)</option>
              <option value="adjustment">Adjustment (+/-)</option>
              <option value="transfer">Transfer</option>
            </select>
            <input placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button onClick={() => setMoveFor(null)}>Cancel</button>
            <button onClick={saveMove} disabled={!delta}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StockRow({
  item, stock, onSaveQty, onMove,
}: {
  item: Item;
  stock?: Stock;
  onSaveQty: (qty: number) => Promise<void> | void;
  onMove: () => void;
}) {
  const [qtyInput, setQtyInput] = useState<number>(stock?.quantity ?? 0);
  useEffect(() => { setQtyInput(stock?.quantity ?? 0); }, [stock?.quantity]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 180px 120px", padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
      <div title={item.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
      <div>{stock?.quantity ?? 0}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" value={qtyInput} onChange={e => setQtyInput(Number(e.target.value))} style={{ width: 90 }} />
        <button onClick={() => onSaveQty(qtyInput)}>Save</button>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        {stock && <button onClick={onMove}>Move</button>}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 16, width: "min(560px, 96vw)" }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
