import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";

type PreviewRow = {
  template: {
    id: number;
    title: string;
    site_id: number;
    unit_id: number | null;
    priority: string;
    status: string;
    due_at: string | null;
    recurrence: string | null;
    recur_interval: number | null;
  };
  will_create: {
    title: string;
    site_id: number;
    unit_id: number | null;
    priority: string;
    due_at: string;
  };
  will_advance_template_to: string;
};

export default function Maintenance() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await api.get<PreviewRow[]>("/api/maintenance/preview");
      setRows(res.data);
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const materialize = async () => {
    setMsg(null);
    setErr(null);
    try {
      const res = await api.post<{ created: number }>("/api/maintenance/materialize");
      setMsg(`Created ${res.data.created} task(s).`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Failed to generate");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Maintenance Scheduler</h1>
          <p className="text-sm opacity-70">Preview and generate recurring maintenance tasks</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 rounded-xl shadow border">Refresh</button>
          <button onClick={materialize} className="px-3 py-2 rounded-xl shadow text-white" style={{background:"#589"}}>
            Generate Next Occurrences
          </button>
        </div>
      </header>

      {msg && <div className="p-3 rounded border border-green-200 bg-green-50 text-green-800">{msg}</div>}
      {err && <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800">{err}</div>}
      {loading && <div className="opacity-70">Loading…</div>}

      <section className="rounded-2xl shadow overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="font-medium">Preview</h2>
          <p className="text-xs opacity-60">These would be created if you click “Generate Next Occurrences”.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Template</th>
              <th className="text-left px-4 py-2">Site</th>
              <th className="text-left px-4 py-2">Unit</th>
              <th className="text-left px-4 py-2">Rule</th>
              <th className="text-left px-4 py-2">Template Due</th>
              <th className="text-left px-4 py-2">New Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-3" colSpan={6}>
                  <span className="opacity-70">Nothing to generate right now.</span>
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{r.template.title}</td>
                  <td className="px-4 py-3">{r.template.site_id}</td>
                  <td className="px-4 py-3">{r.template.unit_id ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.template.recurrence ?? "—"}
                    {r.template.recur_interval ? ` / every ${r.template.recur_interval}` : ""}
                  </td>
                  <td className="px-4 py-3">{r.template.due_at ? new Date(r.template.due_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">{new Date(r.will_create.due_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
