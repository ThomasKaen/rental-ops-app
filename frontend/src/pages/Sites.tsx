import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

type Site = { id: number; name: string; address?: string | null; notes?: string | null };
type Unit = { id: number; site_id: number; name: string; floor?: string | null; notes?: string | null };

// State + Helpers
type TaskLite = {
  id: number;
  status: "new" | "in_progress" | "awaiting_parts" | "blocked" | "done" | "cancelled";
  due_at?: string | null;
};

type SiteCounts = {
  new: number;
  in_progress: number;
  awaiting_parts: number;
  blocked: number;
  done: number;
  cancelled: number;
  overdue: number;
};

const EMPTY_COUNTS: SiteCounts = {
  new: 0, in_progress: 0, awaiting_parts: 0, blocked: 0, done: 0, cancelled: 0, overdue: 0,
};

function computeCounts(tasks: TaskLite[]): SiteCounts {
  const c: SiteCounts = { ...EMPTY_COUNTS };
  const now = Date.now();
  for (const t of tasks) {
    c[t.status] = (c[t.status] ?? 0) + 1;
    if (
      t.due_at &&
      t.status !== "done" &&
      t.status !== "cancelled" &&
      new Date(t.due_at).getTime() < now
    ) {
      c.overdue++;
    }
  }
  return c;
}

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

  // State
  const [counts, setCounts] = useState<Record<number, SiteCounts>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return sites;
    return sites.filter(s => s.name.toLowerCase().includes(k) || (s.address ?? "").toLowerCase().includes(k));
  }, [sites, q]);

  const loadCountsForSites = async (list: Site[]) => {
  setCountsLoading(true);
  try {
    // Fetch all sites in parallel; tolerant of failures
    const results = await Promise.allSettled(
      list.map(async (s) => {
        const r = await api.get(`/tasks?site_id=${s.id}`);
        const c = computeCounts(r.data as TaskLite[]);
        return [s.id, c] as const;
      })
    );
    const next: Record<number, SiteCounts> = {};
    for (const res of results) {
      if (res.status === "fulfilled") {
        const [id, c] = res.value;
        next[id] = c;
      }
    }
    setCounts((prev) => ({ ...prev, ...next }));
  } finally {
    setCountsLoading(false);
  }
};

const loadSites = async () => {
  setLoading(true); setErr(null);
  try {
    const r = await api.get("/sites");
    setSites(r.data);
    await loadCountsForSites(r.data);   // ← add this line
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
          {filtered.map((s) => (
  <div
    key={s.id}
    style={{
      border: "1px solid #eee",
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
      background: selected?.id === s.id ? "#f8fafc" : "#fff",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <div>
        <div style={{ fontWeight: 600 }}>{s.name}</div>
        <div style={{ fontSize: 12, color: "#555" }}>{s.address || "—"}</div>

        {/* 🔹 Task counts badges must be INSIDE the map, so 's' is defined */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {(() => {
            const c = counts[s.id] ?? EMPTY_COUNTS;
            const badge = (
              label: string,
              value: number,
              href: string,
              style?: React.CSSProperties
            ) => (
              <a
                key={label}
                href={href}
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  textDecoration: "none",
                  color: "#111",
                  background: "#fff",
                  ...(style || {}),
                }}
                title={`${label}: ${value}`}
              >
                {label}: {value}
              </a>
            );

            return (
              <>
                {badge("New", c.new, `/tasks?site_id=${s.id}&status=new`)}
                {badge(
                  "In-progress",
                  c.in_progress,
                  `/tasks?site_id=${s.id}&status=in_progress`
                )}
                {badge(
                  "Awaiting",
                  c.awaiting_parts,
                  `/tasks?site_id=${s.id}&status=awaiting_parts`
                )}
                {badge("Blocked", c.blocked, `/tasks?site_id=${s.id}&status=blocked`)}
                {badge("Done", c.done, `/tasks?site_id=${s.id}&status=done`)}
                {badge(
                  "Overdue",
                  c.overdue,
                  `/tasks?site_id=${s.id}&overdue=true`,
                  c.overdue > 0
                    ? {
                        borderColor: "#fecaca",
                        background: "#fff1f2",
                        color: "#991b1b",
                      }
                    : {}
                )}
              </>
            );
          })()}
          {countsLoading && (
            <span style={{ fontSize: 12, color: "#555" }}>Loading…</span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => selectSite(s)}>Open</button>
        <button onClick={() => startEditSite(s)}>Edit</button>
        <button onClick={() => deleteSite(s.id)} style={{ color: "#b91c1c" }}>
          Delete
        </button>
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
