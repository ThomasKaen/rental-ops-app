// src/pages/Sites.tsx
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

type Site = {
  id: number;
  name: string;
  address?: string | null;
  notes?: string | null;
  units?: number | null;
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // modal state
  const [editing, setEditing] = useState<Partial<Site> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Site | null>(null);

  // ---- data ----
  const loadSites = async () => {
    setLoading(true);
    setErr(null);
    try {
      // NOTE: trailing slash avoids 307 redirect in FastAPI (@router.get("/"))
      const r = await api.get<Site[]>("/sites/");
      setSites(r.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // IMPORTANT: no dependencies here — run once
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sites;
    return sites.filter((s) =>
      [s.name, s.address ?? "", s.notes ?? ""].some((v) => v.toLowerCase().includes(t))
    );
  }, [q, sites]);

  // ---- CRUD helpers ----
  const startNew = () => setEditing({ name: "", address: "", notes: "", units: null });
  const startEdit = (s: Site) => setEditing({ ...s });

  const saveSite = async () => {
    if (!editing?.name?.trim()) return;
    const payload = {
      name: editing.name?.trim() ?? "",
      address: (editing.address ?? "").toString().trim() || null,
      notes: (editing.notes ?? "").toString().trim() || null,
      units: editing.units === null || editing.units === undefined ? null : Number(editing.units),
    };
    if (editing.id) {
      await api.put(`/sites/${editing.id}`, payload);
    } else {
      await api.post(`/sites/`, payload); // trailing slash
    }
    setEditing(null);
    await loadSites();
  };

  const deleteSite = async (s: Site) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await api.delete(`/sites/${s.id}`);
    await loadSites();
  };

  // ---- UI ----
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <h1 style={{ margin: "16px 0 6px" }}>Sites</h1>
        <p style={{ color: "#555", marginTop: 0 }}>Manage properties/locations for your rentals.</p>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={startNew}>+ New Site</button>
        <input
          placeholder="Search by name, address, or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        {loading && <span>Loading…</span>}
        {err && <span style={{ color: "#b91c1c" }}>{err}</span>}
      </div>

      {/* list */}
      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(s)}>Edit</button>
                <button onClick={() => setConfirmDelete(s)} style={{ color: "#b91c1c" }}>
                  Delete
                </button>
              </div>
            </div>
            {s.address && <div style={{ color: "#555" }}>{s.address}</div>}
            <div style={{ color: "#777", fontSize: 12 }}>Units: {s.units ?? "–"}</div>
            {s.notes && <div style={{ color: "#444" }}>{s.notes}</div>}
          </div>
        ))}
        {!loading && filtered.length === 0 && <div>No sites yet.</div>}
      </div>

      {/* create/edit modal */}
      {editing && (
        <Modal title={editing.id ? "Edit Site" : "New Site"} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              placeholder="Name"
              value={editing.name ?? ""}
              onChange={(e) => setEditing((v) => ({ ...v!, name: e.target.value }))}
            />
            <input
              placeholder="Address"
              value={editing.address ?? ""}
              onChange={(e) => setEditing((v) => ({ ...v!, address: e.target.value }))}
            />
            <input
              placeholder="Units (optional, number)"
              value={editing.units ?? ""}
              onChange={(e) =>
                setEditing((v) => ({
                  ...v!,
                  units: e.target.value === "" ? null : Number(e.target.value.replace(/[^0-9]/g, "")),
                }))
              }
            />
            <textarea
              placeholder="Notes"
              value={editing.notes ?? ""}
              onChange={(e) => setEditing((v) => ({ ...v!, notes: e.target.value }))}
              rows={4}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button onClick={() => setEditing(null)}>Cancel</button>
            <button onClick={saveSite} disabled={!editing.name?.trim()}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* delete confirm modal */}
      {confirmDelete && (
        <Modal title="Delete Site" onClose={() => setConfirmDelete(null)}>
          <div>Delete “{confirmDelete.name}” and all associated data?</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button onClick={() => { deleteSite(confirmDelete); setConfirmDelete(null); }} style={{ color: "#b91c1c" }}>
              Delete
            </button>
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 16,
          width: "min(560px, 96vw)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
