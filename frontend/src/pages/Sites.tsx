import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

type Site = {
  id: number;
  name: string;
  address?: string | null;
  notes?: string | null;
  units?: number | null;
};

// --- tiny design tokens (no CSS framework) ---
const C = {
  text: "#0f172a",            // slate-900
  textSub: "#475569",         // slate-600
  textMuted: "#64748b",       // slate-500
  border: "#e2e8f0",          // slate-200
  bgCard: "#ffffff",
  bgPage: "#ffffff",
  danger: "#b91c1c",
  primary: "#1d4ed8",
  primaryBg: "#eff6ff",
};

const pageWrap: React.CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "20px 16px 40px" };
const h1Style: React.CSSProperties = { margin: "6px 0 4px", fontSize: 28, fontWeight: 700, color: C.text };
const pLead: React.CSSProperties = { margin: 0, color: C.textMuted };

const toolbar: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", marginTop: 16 };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer" };
const btnPrimary: React.CSSProperties = { ...btn, background: C.primary, color: "#fff", borderColor: C.primary };
const input: React.CSSProperties = { height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", flex: 1, minWidth: 260 };

const card: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  background: C.bgCard,
  padding: 14,
  display: "grid",
  gap: 6,
};

const rowTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 };
const nameStyle: React.CSSProperties = { fontWeight: 600, color: C.text };
const addrStyle: React.CSSProperties = { color: C.textSub };
const metaStyle: React.CSSProperties = { color: C.textMuted, fontSize: 12 };

const btnRow: React.CSSProperties = { display: "flex", gap: 8 };
const btnDanger: React.CSSProperties = { ...btn, color: C.danger, borderColor: "#fecaca", background: "#fff5f5" };



export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  // modal state
  const [editing, setEditing] = useState<Partial<Site> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Site | null>(null);

  // ---- data ----
  const loadSites = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get<Site[]>("/sites/"); // trailing slash avoids 307
      setSites(r.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

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
      name: editing.name!.trim(),
      address: (editing.address ?? "").toString().trim() || null,
      notes: (editing.notes ?? "").toString().trim() || null,
      units: editing.units === null || editing.units === undefined ? null : Number(editing.units),
    };
    if (editing.id) {
      await api.put(`/sites/${editing.id}`, payload);
    } else {
      await api.post(`/sites/`, payload);
    }
    setEditing(null);
    await loadSites();
    alert("Saved ✔");
  };

  const deleteSite = async (s: Site) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await api.delete(`/sites/${s.id}`);
    await loadSites();
    alert("Deleted ✔");
  };

  // ---- UI ----
  return (
    <div style={{ background: C.bgPage, minHeight: "100vh" }}>
      <div style={pageWrap}>
        <div>
          <h1 style={h1Style}>Sites</h1>
          <p style={pLead}>Manage properties/locations for your rentals.</p>
        </div>

        <div style={toolbar}>
          <button onClick={startNew} style={btnPrimary}>+ New Site</button>
          <input
            placeholder="Search by name, address, or notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={input}
          />
          {loading && <span style={{ color: C.textMuted }}>Loading…</span>}
          {err && <span style={{ color: C.danger }}>{err}</span>}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {filtered.map((s) => (
            <div key={s.id} style={card}>
              <div style={rowTop}>
                <div style={nameStyle}>{s.name}</div>
                <div style={btnRow}>
                  <button onClick={() => startEdit(s)} style={btn}>Edit</button>
                  <button onClick={() => setConfirmDelete(s)} style={btnDanger}>Delete</button>
                  <button onClick={() => navigate({ pathname: "/units", search: `?site_id=${s.id}` })} style={btn}>Manage units</button>
                </div>
              </div>
              {s.address && <div style={addrStyle}>{s.address}</div>}
              <div style={metaStyle}>Units: {s.units ?? "–"}</div>
              {s.notes && <div style={{ color: C.text }}>{s.notes}</div>}
            </div>
          ))}
          {!loading && filtered.length === 0 && <div style={{ color: C.textMuted }}>No sites yet.</div>}
        </div>
      </div>

      {/* create/edit modal */}
      {editing && (
        <Modal title={editing.id ? "Edit Site" : "New Site"} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input label="Name" value={editing.name ?? ""} onChange={(v) => setEditing((s) => ({ ...s!, name: v }))} />
            <Input label="Address" value={editing.address ?? ""} onChange={(v) => setEditing((s) => ({ ...s!, address: v }))} />
            <Input
              label="Units (optional)"
              value={editing.units ?? ""}
              onChange={(v) => setEditing((s) => ({ ...s!, units: v === "" ? null : Number(String(v).replace(/[^0-9]/g, "")) }))}
              inputMode="numeric"
            />
            <Textarea label="Notes" rows={4} value={editing.notes ?? ""} onChange={(v) => setEditing((s) => ({ ...s!, notes: v }))} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setEditing(null)} style={btn}>Cancel</button>
            <button onClick={saveSite} style={btnPrimary} disabled={!editing.name?.trim()}>Save</button>
          </div>
        </Modal>
      )}

      {/* delete confirm modal */}
      {confirmDelete && (
        <Modal title="Delete Site" onClose={() => setConfirmDelete(null)}>
          <div style={{ color: C.text }}>Delete “{confirmDelete.name}” and all associated data?</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setConfirmDelete(null)} style={btn}>Cancel</button>
            <button onClick={() => { deleteSite(confirmDelete); setConfirmDelete(null); }} style={btnDanger}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- tiny input/textarea primitives (matching spacing/colors) ---
function Input({
  label, value, onChange, inputMode,
}: { label: string; value: string | number; onChange: (v: string) => void; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: C.textSub }}>{label}</span>
      <input
        style={{ ...input, minWidth: 0, width: "100%" }}
        value={value as any}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
      />
    </label>
  );
}

function Textarea({
  label, rows = 4, value, onChange,
}: { label: string; rows?: number; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: C.textSub }}>{label}</span>
      <textarea
        rows={rows}
        style={{ ...input, minHeight: rows * 22, paddingTop: 8, paddingBottom: 8, resize: "vertical" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// --- simple modal ---
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, width: "min(560px, 96vw)", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ ...btn, padding: "6px 10px" }}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
