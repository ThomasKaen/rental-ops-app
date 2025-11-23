// Units.tsx — service-based rewrite
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  listSites,
  listUnitsForSite,
  createUnit,
  updateUnit,
  deleteUnit,
  type Site,
  type Unit,
} from "../services/units";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export default function UnitsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<Partial<Unit> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Unit | null>(null);

  const [searchParams] = useSearchParams();

  // Preselect site
  useEffect(() => {
    const sid = searchParams.get("site_id");
    if (sid) setSiteId(Number(sid));
  }, []);

  // Load sites
  useEffect(() => {
    listSites().then(setSites).catch(() => {});
  }, []);

  // Load units for selected site
  useEffect(() => {
    (async () => {
      if (!siteId) {
        setUnits([]);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = await listUnitsForSite(siteId as number);
        setUnits(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load units");
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return units;
    return units.filter((u) =>
      [u.name, u.notes ?? ""].some((v) => v.toLowerCase().includes(t))
    );
  }, [q, units]);

  const startNew = () => {
    if (!siteId) return alert("Pick a site first.");
    setEditing({ site_id: siteId as number, name: "", notes: "" });
  };

  const startEdit = (u: Unit) => setEditing({ ...u });

  const bulkAdd = async () => {
    if (!siteId) return alert("Pick a site first.");
    const raw = prompt("How many units?");
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return;

    for (let i = 1; i <= n; i++) {
      await createUnit(siteId as number, { name: `Unit ${i}`, notes: null });
    }

    const data = await listUnitsForSite(siteId as number);
    setUnits(data);
    alert(`Created ${n} units ✔`);
  };

  const saveUnit = async () => {
    if (!editing?.name?.trim() || !editing?.site_id) return;

    const payload = {
      name: editing.name!.trim(),
      notes: editing.notes?.trim() || null,
    };

    if (editing.id) {
      await updateUnit(editing.id, payload);
    } else {
      await createUnit(editing.site_id, payload);
    }

    setEditing(null);
    if (siteId) {
      const data = await listUnitsForSite(siteId as number);
      setUnits(data);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteUnit(confirmDelete.id);
    if (siteId) {
      const data = await listUnitsForSite(siteId as number);
      setUnits(data);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">

        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Units</h1>
          <p className="text-sm text-slate-500">Manage units belonging to sites.</p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
            value={String(siteId)}
            onChange={(e) =>
              setSiteId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select site…</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Input
            placeholder="Search units"
            className="h-9 flex-1 min-w-[200px]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={!siteId}
          />

          <Button size="sm" onClick={startNew} disabled={!siteId}>
            + New Unit
          </Button>

          <Button variant="outline" size="sm" onClick={bulkAdd} disabled={!siteId}>
            Bulk Add
          </Button>

          {loading && <span className="text-xs text-slate-500">Loading…</span>}
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>

        {!siteId && (
          <p className="text-sm text-slate-500">Pick a site to see units.</p>
        )}

        {siteId && (
          <div className="grid gap-3">
            {filtered.map((u) => (
              <Card key={u.id} className="border-slate-200">
                <CardHeader className="flex flex-row justify-between pb-2">
                  <div>
                    <CardTitle>{u.name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      Unit ID: {u.id} • Site ID: {u.site_id}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(u)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600"
                      onClick={() => setConfirmDelete(u)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>

                {u.notes && (
                  <CardContent>
                    <p className="text-sm text-slate-700">{u.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}

            {!loading && filtered.length === 0 && (
              <p className="text-sm text-slate-500">No units found.</p>
            )}
          </div>
        )}
      </div>

      {/* EDIT / CREATE MODAL */}
      {editing && (
        <Modal title={editing.id ? "Edit Unit" : "New Unit"} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s!, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={editing.notes ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s!, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveUnit} disabled={!editing?.name?.trim()}>
              Save
            </Button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <Modal title="Delete Unit" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-800">
            Delete “{confirmDelete.name}”?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>

            <Button
              size="sm"
              className="bg-red-600 text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center px-4 z-50">
      <div className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
