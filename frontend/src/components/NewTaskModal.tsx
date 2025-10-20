import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const C = { text: "#0f172a", textSub: "#475569", textMuted: "#64748b", border: "#e2e8f0", danger: "#b91c1c", primary: "#1d4ed8" };
const labelStyle: React.CSSProperties = { fontSize: 13, color: C.textSub };
const input: React.CSSProperties = { height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${C.border}`, outline: "none", width: "100%" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer" };
const btnPrimary: React.CSSProperties = { ...btn, background: C.primary, color: "#fff", borderColor: C.primary };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultSiteId?: number;
  defaultUnitId?: number;
};

type SiteOpt = { id: number; name: string };
type UnitOpt = { id: number; name: string; site_id: number };

export default function NewTaskModal({ open, onClose, onCreated, defaultSiteId, defaultUnitId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"red" | "amber" | "green">("amber");
  const [dueAt, setDueAt] = useState<string>("");

  const [sites, setSites] = useState<SiteOpt[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");
  const [units, setUnits] = useState<UnitOpt[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<string>("");
  const [recurInterval, setRecurInterval] = useState<number>(1);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const r = await api.get<SiteOpt[]>("/sites/");
        setSites(r.data);
      } catch (e: any) {
        setErr(toErrMsg(e));
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (defaultSiteId) setSiteId(defaultSiteId);
    if (defaultUnitId) setUnitId(defaultUnitId);
  }, [open, defaultSiteId, defaultUnitId]);

  useEffect(() => {
    (async () => {
      if (!siteId) { setUnits([]); setUnitId(""); return; }
      const r = await api.get<UnitOpt[]>(`/sites/${siteId}/units/`);
      setUnits(r.data);
      if (unitId && !r.data.some(u => u.id === unitId)) setUnitId("");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true); setErr(null);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
      };
      if (dueAt) payload.due_at = new Date(dueAt).toISOString();
      if (siteId) payload.site_id = siteId;
      if (unitId) payload.unit_id = unitId;

      // IMPORTANT: use trailing slash to avoid 307
      await api.post("/tasks/", payload);

      onCreated?.();
      onClose();
      setTitle(""); setDescription(""); setDueAt(""); setPriority("amber"); setSiteId(""); setUnitId("");
      alert("Task created ✔");
    } catch (e: any) {
      setErr(toErrMsg(e));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, width: "min(640px, 96vw)", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>New Task</h3>
          <button onClick={onClose} style={{ ...btn, padding: "6px 10px" }}>Close</button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelStyle}>Title *</span>
            <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Fix leaking tap" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelStyle}>Description</span>
            <textarea style={{ ...input, minHeight: 90, paddingTop: 8, paddingBottom: 8, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={input}>
                <option value="red">Red</option>
                <option value="amber">Amber</option>
                <option value="green">Green</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Due</span>
              <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} style={input} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Site</span>
              <select
                value={String(siteId)}
                onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : "")}
                style={input}
              >
                <option value="">(none)</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Unit</span>
              <select
                value={String(unitId)}
                onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : "")}
                style={input}
                disabled={!siteId}
                title={siteId ? "Choose a unit" : "Select a site first"}
              >
                <option value="">{siteId ? "(none)" : "Select a site first"}</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <input
      type="checkbox"
      checked={isRecurring}
      onChange={(e) => setIsRecurring(e.target.checked)}
    />
    <span style={labelStyle}>Make this task recurring</span>
  </label>

  {isRecurring && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={labelStyle}>Recurrence pattern</span>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          style={input}
        >
          <option value="">(choose)</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={labelStyle}>Every (interval)</span>
        <input
          type="number"
          min={1}
          value={recurInterval}
          onChange={(e) => setRecurInterval(Math.max(1, Number(e.target.value)))}
          style={input}
        />
      </label>
    </div>
  )}
</div>


          {err && <div style={{ color: C.danger }}>{err}</div>}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onClose} style={btn}>Cancel</button>
          <button onClick={handleSave} style={btnPrimary} disabled={!canSave || saving}>{saving ? "Saving…" : "Create Task"}</button>
        </div>
      </div>
    </div>
  );
}

// Turn FastAPI validation errors into a readable string
function toErrMsg(e: any): string {
  const detail = e?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // pydantic error list
    return detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; ");
  }
  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return typeof detail === "string" ? detail : (e?.message || "Request failed");
}
