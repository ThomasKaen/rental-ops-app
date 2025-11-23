import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listSites,
  createSite,
  updateSite,
  deleteSite,
  type Site,
} from "../services/sites";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<Partial<Site> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Site | null>(null);

  const navigate = useNavigate();

  const loadSites = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await listSites();
      setSites(data);
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to load sites"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sites;
    return sites.filter((s) =>
      [s.name, s.address ?? "", s.notes ?? ""].some((v) =>
        v.toLowerCase().includes(t)
      )
    );
  }, [q, sites]);

  const startNew = () =>
    setEditing({ name: "", address: "", notes: "", units: null });

  const startEdit = (s: Site) => setEditing({ ...s });

  const saveSite = async () => {
    if (!editing?.name?.trim()) return;
    const payload = {
      name: editing.name!.trim(),
      address: (editing.address ?? "").toString().trim() || null,
      notes: (editing.notes ?? "").toString().trim() || null,
      units:
        editing.units === null || editing.units === undefined
          ? null
          : Number(editing.units),
    };

    try {
      if (editing.id) {
        await updateSite(editing.id, payload);
      } else {
        await createSite(payload);
      }
      setEditing(null);
      await loadSites();
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to save site"
      );
    }
  };

  const handleDeleteSite = async (s: Site) => {
    try {
      await deleteSite(s.id);
      await loadSites();
      setConfirmDelete(null);
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to delete site"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Sites</h1>
          <p className="text-sm text-slate-500">
            Manage properties / locations for your rentals.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={startNew} className="h-9 px-3">
            + New Site
          </Button>

          <Input
            className="h-9 w-full max-w-md"
            placeholder="Search by name, address, or notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {loading && (
            <span className="text-xs text-slate-500">Loading…</span>
          )}
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>

        {/* List */}
        <div className="grid gap-3">
          {filtered.map((s) => (
            <Card key={s.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {s.name}
                  </CardTitle>
                  {s.address && (
                    <p className="text-sm text-slate-600">{s.address}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Units: {s.units ?? "–"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmDelete(s)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate({
                        pathname: "/units",
                        search: `?site_id=${s.id}`,
                      })
                    }
                  >
                    Manage units
                  </Button>
                </div>
              </CardHeader>

              {s.notes && (
                <CardContent>
                  <p className="text-sm text-slate-700">{s.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-sm text-slate-500">No sites yet.</p>
          )}
        </div>
      </div>

      {/* Create / edit modal */}
      {editing && (
        <Modal
          title={editing.id ? "Edit Site" : "New Site"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs uppercase text-slate-500">
                Name
              </Label>
              <Input
                value={editing.name ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s!, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase text-slate-500">
                Address
              </Label>
              <Input
                value={editing.address ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s!, address: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase text-slate-500">
                Units (optional)
              </Label>
              <Input
                inputMode="numeric"
                value={editing.units ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  const cleaned = v.replace(/[^0-9]/g, "");
                  setEditing((s) => ({
                    ...s!,
                    units: cleaned === "" ? null : Number(cleaned),
                  }));
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase text-slate-500">
                Notes
              </Label>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveSite}
              disabled={!editing.name?.trim()}
            >
              Save
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal
          title="Delete Site"
          onClose={() => setConfirmDelete(null)}
        >
          <p className="text-sm text-slate-800">
            Delete “{confirmDelete.name}” and all associated data?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleDeleteSite(confirmDelete)}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// simple modal shell (keeps behaviour but looks nicer)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-900">
            {title}
          </h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
