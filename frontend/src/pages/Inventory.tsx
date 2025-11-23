// Inventory.tsx — service-based version
import { useEffect, useMemo, useState } from "react";

import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  listInventorySites,
  getStockForSite,
  upsertStock,
  moveStock,
  type Item,
  type Stock,
  type MovementReason,
} from "../services/inventory";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function Inventory() {
  // items
  const [items, setItems] = useState<Item[]>([]);
  const [iq, setIq] = useState("");
  const filteredItems = useMemo(() => {
    const k = iq.trim().toLowerCase();
    if (!k) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(k) ||
        i.sku.toLowerCase().includes(k) ||
        (i.category ?? "").toLowerCase().includes(k)
    );
  }, [items, iq]);

  // sites + stock
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");
  const [stock, setStock] = useState<Stock[]>([]);

  // ui
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [moveFor, setMoveFor] = useState<Stock | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<MovementReason>("usage");
  const [reference, setReference] = useState("");

  // load items + sites
  useEffect(() => {
    (async () => {
      try {
        const it = await listItems();
        setItems(it);
        const st = await listInventorySites();
        setSites(st);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load data");
      }
    })();
  }, []);

  // load stock
  useEffect(() => {
    if (siteId) {
      (async () => {
        setLoading(true);
        setErr(null);
        try {
          const st = await getStockForSite(siteId as number);
          setStock(st);
        } catch (e: any) {
          setErr(e?.message ?? "Failed to load stock");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setStock([]);
    }
  }, [siteId]);

  // ----- ITEM CRUD -----

  const startNewItem = () =>
    setEditing({
      name: "",
      sku: "",
      uom: "pcs",
      category: "",
      notes: "",
    });

  const startEditItem = (it: Item) => setEditing({ ...it });

  const saveItem = async () => {
    if (!editing?.name?.trim() || !editing?.sku?.trim()) return;
    try {
      const payload = {
        name: editing.name!,
        sku: editing.sku!,
        uom: editing.uom!,
        category: editing.category ?? null,
        notes: editing.notes ?? null,
      };

      if (editing.id) {
        await updateItem(editing.id, payload);
      } else {
        await createItem(payload);
      }

      setEditing(null);

      const it = await listItems();
      setItems(it);
      if (siteId) {
        const st = await getStockForSite(siteId as number);
        setStock(st);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save item");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteItem(id);
    const it = await listItems();
    setItems(it);
    if (siteId) {
      const st = await getStockForSite(siteId as number);
      setStock(st);
    }
  };

  // ----- STOCK -----

  const setQty = async (itemId: number, qty: number) => {
    if (!siteId) return;
    await upsertStock(siteId as number, itemId, qty);
    const st = await getStockForSite(siteId as number);
    setStock(st);
  };

  const openMove = (s: Stock) => {
    setMoveFor(s);
    setDelta(0);
    setReason("usage");
    setReference("");
  };

  const saveMove = async () => {
    if (!moveFor || !delta) {
      setMoveFor(null);
      return;
    }
    await moveStock(moveFor.id, delta, reason, reference);
    setMoveFor(null);

    if (siteId) {
      const st = await getStockForSite(siteId as number);
      setStock(st);
    }
  };

  const stockForItem = (itemId: number) =>
    stock.find((s) => s.item_id === itemId);

  // UI ------------------------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <p className="text-sm text-slate-500">
          Manage inventory items and per-site stock.
        </p>

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* ITEMS */}
          <Card className="border-slate-200 shadow-md">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search items"
                  value={iq}
                  onChange={(e) => setIq(e.target.value)}
                  className="h-9 max-w-xs"
                />
                <div className="flex-1" />
                <Button size="sm" onClick={startNewItem}>
                  + New Item
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200">
                <div className="grid grid-cols-[1.2fr,0.8fr,0.7fr,0.7fr,auto] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
                  <div>Name</div>
                  <div>SKU</div>
                  <div>Category</div>
                  <div>UoM</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="max-h-[460px] overflow-auto divide-y divide-slate-100 text-sm">
                  {filteredItems.length === 0 && (
                    <div className="px-3 py-3 text-sm text-slate-500">
                      No items found.
                    </div>
                  )}

                  {filteredItems.map((it) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-[1.2fr,0.8fr,0.7fr,0.7fr,auto] items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <div className="truncate">{it.name}</div>
                      <div className="truncate text-slate-700">{it.sku}</div>
                      <div className="truncate text-slate-600">
                        {it.category || <span className="text-slate-400">—</span>}
                      </div>
                      <div className="text-slate-700">{it.uom}</div>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => startEditItem(it)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600"
                          onClick={() => handleDeleteItem(it.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STOCK */}
          <Card className="border-slate-200 shadow-md">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Site</Label>
                <select
                  className="h-9 min-w-[180px] rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={String(siteId)}
                  onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select site…</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {siteId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3"
                    onClick={() => siteId && getStockForSite(siteId).then(setStock)}
                  >
                    Refresh
                  </Button>
                )}

                {loading && (
                  <span className="text-xs text-slate-500">Loading…</span>
                )}
              </div>

              {siteId ? (
                <div className="rounded-lg border border-slate-200">
                  <div className="grid grid-cols-[1.4fr,0.6fr,0.9fr,auto] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
                    <div>Item</div>
                    <div>On hand</div>
                    <div>Set quantity</div>
                    <div className="text-right">Move / Save</div>
                  </div>

                  <div className="max-h-[460px] divide-y divide-slate-100 overflow-auto text-sm">
                    {items.map((it) => {
                      const st = stockForItem(it.id);
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
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Select a site to view stock.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ITEM EDIT DIALOG */}
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit item" : "New item"}</DialogTitle>
              <DialogDescription>Manage catalogue items</DialogDescription>
            </DialogHeader>

            {editing && (
              <div className="mt-4 space-y-3">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={editing.name ?? ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...(s as Item), name: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>SKU</Label>
                  <Input
                    value={editing.sku ?? ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...(s as Item), sku: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>UoM</Label>
                    <Input
                      value={editing.uom ?? "pcs"}
                      onChange={(e) =>
                        setEditing((s) => ({ ...(s as Item), uom: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Input
                      value={editing.category ?? ""}
                      onChange={(e) =>
                        setEditing((s) => ({ ...(s as Item), category: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={editing.notes ?? ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...(s as Item), notes: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveItem}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MOVE STOCK */}
        <Dialog open={!!moveFor} onOpenChange={(o) => !o && setMoveFor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move stock</DialogTitle>
              <DialogDescription>Record usage, delivery or adjustments</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label>Delta</Label>
                <Input
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Reason</Label>
                <select
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as MovementReason)}
                >
                  <option value="usage">Usage</option>
                  <option value="delivery">Delivery</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Reference</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setMoveFor(null)}>
                Cancel
              </Button>
              <Button disabled={!delta} onClick={saveMove}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StockRow({
  item,
  stock,
  onSaveQty,
  onMove,
}: {
  item: Item;
  stock?: Stock;
  onSaveQty: (qty: number) => void;
  onMove: () => void;
}) {
  const [qtyInput, setQtyInput] = useState(stock?.quantity ?? 0);

  useEffect(() => {
    setQtyInput(stock?.quantity ?? 0);
  }, [stock?.quantity]);

  const under = (stock?.quantity ?? 0) <= 0;

  return (
    <div className="grid grid-cols-[1.4fr,0.6fr,0.9fr,auto] items-center gap-2 px-3 py-2 text-sm">
      <div>{item.name}</div>
      <div className={under ? "text-red-600 font-semibold" : ""}>
        {stock?.quantity ?? 0}
      </div>

      <Input
        type="number"
        className="h-8"
        value={qtyInput}
        onChange={(e) => setQtyInput(Number(e.target.value))}
      />

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => onSaveQty(qtyInput)}>
          Save
        </Button>
        {stock && (
          <Button size="sm" variant="ghost" onClick={onMove}>
            Move
          </Button>
        )}
      </div>
    </div>
  );
}
