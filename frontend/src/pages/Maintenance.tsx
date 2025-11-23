import { useEffect, useState, useCallback } from "react";

import {
  getMaintenancePreview,
  materializeMaintenance,
  type PreviewRow,
} from "../services/maintenance";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Maintenance() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const data = await getMaintenancePreview();
      setRows(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to load maintenance preview"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const materialize = async () => {
    setMessage(null);
    setError(null);
    try {
      const created = await materializeMaintenance();
      setMessage(`Created ${created} task(s).`);
      await loadPreview();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to generate maintenance tasks"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Maintenance Scheduler
            </h1>
            <p className="text-sm text-slate-500">
              Preview and generate recurring maintenance tasks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreview}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={materialize}
              disabled={loading}
            >
              Generate Next Occurrences
            </Button>
          </div>
        </header>

        {/* Messages */}
        {message && (
          <Card className="border-green-200 bg-green-50/80">
            <CardContent className="py-3 text-sm text-green-800">
              {message}
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-red-200 bg-red-50/80">
            <CardContent className="py-3 text-sm text-red-800">
              {error}
            </CardContent>
          </Card>
        )}
        {loading && (
          <div className="text-sm text-slate-500">Loading…</div>
        )}

        {/* Preview table */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              These tasks will be created when you run{" "}
              <span className="font-medium">
                Generate Next Occurrences
              </span>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Template</th>
                  <th className="px-4 py-2 text-left">Site</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Rule</th>
                  <th className="px-4 py-2 text-left">Current Due</th>
                  <th className="px-4 py-2 text-left">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      <span className="text-sm text-slate-500">
                        Nothing to generate right now.
                      </span>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3">
                        {r.template.title}
                      </td>
                      <td className="px-4 py-3">
                        {r.template.site_id}
                      </td>
                      <td className="px-4 py-3">
                        {r.template.unit_id ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.template.recurrence ?? "—"}
                        {r.template.recur_interval
                          ? ` / every ${r.template.recur_interval}`
                          : ""}
                      </td>
                      <td className="px-4 py-3">
                        {r.template.due_at
                          ? new Date(
                              r.template.due_at
                            ).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(
                          r.will_create.due_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
