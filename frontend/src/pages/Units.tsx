import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

// ---- types ----
type Site = { id: number; name: string };
type Unit = { id: number; site_id: number; name: string; notes?: string | null };

// ---- design tokens (same as Sites.tsx) ----
const C = {
  text: "#0f172a",
  textSub: "#475569",
  textMuted: "#64748b",
  border: "#e2e8f0",
  bgCard: "#ffffff",
  bgPage: "#ffffff",
  danger: "#b91c1c",
  primary: "#1d4ed8",
};
const pageWrap: React.CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "20px 16px 40px" };
const h1Style: React.CSSProperties = { margin: "6px 0 4px", fontSize: 28, fontWeight: 700, color: C.text };
const pLead: React.CSSProperties = { margin: 0, color: C.textMuted };
const toolbar: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", marginTop: 16, flexWrap: "wrap" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer" };
const btnPrimary: React.CSSProperties = { ...btn, background: C.primary, color: "#fff", borderColor: C.primary };
const btnDanger: React.CSSProperties = { ...btn, color: C.danger, borderColor: "#fecaca", background: "#fff5f5" };
const input: React.CSSProperties = { height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none" };
const selectStyle: React.CSSProperties = { ...input, minWidth: 220 };
const searchStyle: React.CSSProperties = { ...input, flex: 1, minWidth: 220 };
const card: React.CSSProperties = { border: `1px solid ${C.border}`, borderRadius: 12, background: C.bgCard, padding: 14, display: "grid", gap: 6 };
const rowTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 };
const nameStyle: React.CSSProperties = { fontWeight: 600, color: C.text };
const metaStyle: React.CSSProperties = { color: C.textMuted, fontSize: 12 };

// ---- page ----
export default function UnitsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // modal state
  const [editing, setEditing] = useState<Partial<Unit> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Unit | null>(null);

  // query param and preselect on mount
  const [searchParams] = useSearchParams();
  useEffect(() => {
      const sid = searchParams.get("site_id");
      if (sid) setSiteId(Number(sid));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load sites once
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get<Site[]>("sites/"); // trailing slash to avoid 307
        setSites(r.data);
      } catch {
        /* ignore for now */
      }
    })();
  }, []);

  // load units when site changes
  useEffect(() => {
    (async () => {
      if (!siteId) { setUnits([]); return; }
      setLoading(true); setErr(null);
      try {
        const r = await api.get<Unit[]>(`sites/${siteId}/units/`); // trailing slash
        setUnits(r.data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load units");
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return units;
    return units.filter(u => [u.name, u.notes ?? ""].some(v => v.toLowerCase().includes(t)));
  }, [q, units]);

  // ---- CRUD ----
  const startNew = () => {
    if (!siteId) { alert("Pick a site first."); return; }
    setEditing({ site_id: siteId as number, name: "", notes: "" });
  };
  const startEdit = (u: Unit) => setEditing({ ...u });

  const bulkAdd = async () => {
  if (!siteId) { alert("Pick a site first."); return; }
  const raw = prompt("How many units to create? (e.g., 3)");
  if (!raw) return;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return;

  // Create Unit 1..N
  for (let i = 1; i <= n; i++) {
    await api.post(`sites/${siteId}/units/`, { name: `Unit ${i}`, notes: null });
  }
  // reload
  const r = await api.get(`sites/${siteId}/units/`);
  setUnits(r.data);
  alert(`Created ${n} units ✔`);
  };

  const saveUnit = async () => {
    if (!editing?.name?.trim() || !editing?.site_id) return;
    const payload = {
      name: editing.name!.trim(),
      notes: (editing.notes ?? "").toString().trim() || null,
    };
    if (editing.id) {
      await api.put(`units/${editing.id}`, payload);
    } else {
      await api.post(`sites/${editing.site_id}/units/`, payload);
    }
    setEditing(null);
    // reload
    if (siteId) {
      const r = await api.get<Unit[]>(`sites/${siteId}/units/`);
      setUnits(r.data);
    }
    alert("Saved ✔");
  };

  const deleteUnit = async (u: Unit) => {
    if (!confirm(`Delete unit "${u.name}"?`)) return;
    await api.delete(`units/${u.id}`);
    if (siteId) {
      const r = await api.get<Unit[]>(`sites/${siteId}/units/`);
      setUnits(r.data);
    }
    alert("Deleted ✔");
  };

  return (
    <div style={{ background: C.bgPage, minHeight: "100vh" }}>
      <div style={pageWrap}>
        <div>
          <h1 style={h1Style}>Units</h1>
          <p style={pLead}>View and manage units for each site.</p>
        </div>

        <div style={toolbar}>
          <select
            value={String(siteId)}
            onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">Select site…</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <input
            placeholder="Search units (name or notes)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={searchStyle}
            disabled={!siteId}
          />

          <button onClick={startNew} style={btnPrimary} disabled={!siteId}>+ New Unit</button>
          <button onClick={bulkAdd} style={btn}>Bulk Add</button>

          {loading && <span style={{ color: C.textMuted }}>Loading…</span>}
          {err && <span style={{ color: C.danger }}>{err}</span>}
        </div>

        {!siteId && <div style={{ marginTop: 12, color: C.textMuted }}>Pick a site to see its units.</div>}

        {siteId && (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {filtered.map(u => (
              <div key={u.id} style={card}>
                <div style={rowTop}>
                  <div style={nameStyle}>{u.name}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(u)} style={btn}>Edit</button>
                    <button onClick={() => setConfirmDelete(u)} style={btnDanger}>Delete</button>
                  </div>
                </div>
                <div style={metaStyle}>Unit ID: {u.id} • Site ID: {u.site_id}</div>
                {u.notes && <div style={{ color: C.text }}>{u.notes}</div>}
              </div>
            ))}
            {!loading && filtered.length === 0 && <div style={{ color: C.textMuted }}>No units yet.</div>}
          </div>
        )}
      </div>

      {/* create/edit modal */}
      {editing && (
        <Modal title={editing.id ? "Edit Unit" : "New Unit"} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <LabeledInput
              label="Name"
              value={editing.name ?? ""}
              onChange={(v) => setEditing(s => ({ ...s!, name: v }))}
            />
            <LabeledTextarea
              label="Notes"
              value={editing.notes ?? ""}
              onChange={(v) => setEditing(s => ({ ...s!, notes: v }))}
              rows={4}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setEditing(null)} style={btn}>Cancel</button>
            <button onClick={saveUnit} style={btnPrimary} disabled={!editing.name?.trim()}>Save</button>
          </div>
        </Modal>
      )}

      {/* delete confirm */}
      {confirmDelete && (
        <Modal title="Delete Unit" onClose={() => setConfirmDelete(null)}>
          <div>Delete “{confirmDelete.name}”?</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setConfirmDelete(null)} style={btn}>Cancel</button>
            <button onClick={() => { deleteUnit(confirmDelete); setConfirmDelete(null); }} style={btnDanger}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---- tiny inputs + modal (same style language) ----
function LabeledInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: C.textSub }}>{label}</span>
      <input style={{ ...input, width: "100%" }} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function LabeledTextarea({
  label, value, onChange, rows = 4,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: C.textSub }}>{label}</span>
      <textarea
        rows={rows}
        style={{
          ...input,
          minHeight: rows * 22,
          paddingTop: 8,
          paddingBottom: 8,
          resize: "vertical",
          width: "100%",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

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
