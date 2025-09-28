import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

type Site = { id: number; name: string; address?: string | null; notes?: string | null };
type Unit = { id: number; site_id: number; name: string; floor?: string | null; notes?: string | null };

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Site | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  // new/edit site
  const [editingSite, setEditingSite] = useState<Partial<Site> | null>(null);

  // new unit
  const [newUnitName, setNewUnitName] = useState("");

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return sites;
    return sites.filter(s => s.name.toLowerCase().includes(k) || (s.address ?? "").toLowerCase().includes(k));
  }, [sites, q]);

  const loadSites = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await api.get("/sites");
      setSites(r.data);
      // refresh units for selected if any
      if (selected) {
        const s = r.data.find((x: Site) => x.id === selected.id);
        if (!s) { setSelected(null); setUnits([]); }
        else await loadUnits(s.id);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load sites");
    } finally { setLoading(false); }
  };

  const loadUnits = async (siteId: number) => {
    try {
      const r = await api.get(`/sites/${siteId}/units`);
      setUnits(r.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load units");
    }
  };

  useEffect(() => { loadSites(); /* eslint-disable-next-line */ }, []);

  const startCreateSite = () => setEditingSite({ name: "", address: "", notes: "" });
  const startEditSite = (s: Site) => setEditingSite({ ...s });

  const saveSite = async () => {
    if (!editingSite?.name?.trim()) return;
    try {
      if (editingSite.id) {
        await api.put(`/sites/${editingSite.id}`, {
          name: editingSite.name,
          address: editingSite.address ?? null,
          notes: editingSite.notes ?? null,
        });
      } else {
        await api.post(`/sites`, {
          name: editingSite.name,
          address: editingSite.address ?? null,
          notes: editingSite.notes ?? null,
        });
      }
      setEditingSite(null);
      await loadSites();
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to save site");
    }
  };

  const deleteSite = async (id: number) => {
    if (!confirm("Delete this site?")) return;
    await api.delete(`/sites/${id}`);
    if (selected?.id === id) { setSelected(null); setUnits([]); }
    await loadSites();
  };

  const selectSite = async (s: Site) => {
    setSelected(s);
    await loadUnits(s.id);
  };

  const addUnit = async () => {
    if (!selected || !newUnitName.trim()) return;
    await api.post(`/sites/${selected.id}/units`, { name: newUnitName });
    setNewUnitName("");
    await loadUnits(selected.id);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input placeholder="Search sites…" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={startCreateSite}>+ New Site</button>
        {err && <div style={{ color: "#b91c1c", marginLeft: 8 }}>{err}</div>}
      </div>

      {loading && <div>Loading…</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Sites list */}
        <div>
          {filtered.map(s => (
            <div key={s.id}
                 style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, marginBottom: 8, background: selected?.id === s.id ? "#f8fafc" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>{s.address || "—"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => selectSite(s)}>Open</button>
                  <button onClick={() => startEditSite(s)}>Edit</button>
                  <button onClick={() => deleteSite(s.id)} style={{ color: "#b91c1c" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && <div>No sites.</div>}
        </div>

        {/* Units panel */}
        <div>
          {selected ? (
            <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{selected.name} — Units</h3>
                <a href={`/tasks?site_id=${selected.id}`}>View tasks for this site →</a>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input placeholder="New unit name" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} />
                <button onClick={addUnit} disabled={!newUnitName.trim()}>Add Unit</button>
              </div>

              {units.length === 0 && <div>No units yet.</div>}
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {units.map(u => (
                  <li key={u.id}>{u.name}{u.floor ? ` · ${u.floor}` : ""}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ color: "#555" }}>Select a site to manage its units.</div>
          )}
        </div>
      </div>

      {/* Site modal */}
      {editingSite && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <h3 style={{ marginTop: 0 }}>{editingSite.id ? "Edit Site" : "New Site"}</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <input placeholder="Name" value={editingSite.name ?? ""} onChange={e => setEditingSite(s => ({ ...s!, name: e.target.value }))} />
              <input placeholder="Address" value={editingSite.address ?? ""} onChange={e => setEditingSite(s => ({ ...s!, address: e.target.value }))} />
              <textarea placeholder="Notes" value={editingSite.notes ?? ""} onChange={e => setEditingSite(s => ({ ...s!, notes: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={() => setEditingSite(null)}>Cancel</button>
              <button onClick={saveSite} disabled={!editingSite.name?.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalBackdrop: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const modalCard: React.CSSProperties = { background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 16, width: "min(560px, 96vw)" };
