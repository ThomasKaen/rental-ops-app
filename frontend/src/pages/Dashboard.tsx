import { useEffect, useState } from "react";

import {
  getSummaryAndOverdue,
  type Summary,
  type OverdueRow,
} from "../services/summary";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [overdue, setOverdue] = useState<OverdueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { summary, overdue } = await getSummaryAndOverdue();
      setSummary(summary);
      setOverdue(overdue);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const k = summary?.kpis;
  const kpis: { label: string; value: number }[] = k
    ? [
        { label: "Sites", value: k.sites },
        { label: "Units", value: k.units },
        { label: "Open Tasks", value: k.open_tasks },
        { label: "Overdue", value: k.overdue },
        { label: "Due Today", value: k.due_today },
        { label: "Due This Week", value: k.due_this_week },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Overview of sites, units and open maintenance tasks.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </header>

        {/* Error notice */}
        {error && (
          <Card className="border-red-200 bg-red-50/80">
            <CardContent className="py-3 text-sm text-red-800">
              {error}
            </CardContent>
          </Card>
        )}

        {/* KPI cards */}
        {kpis.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {kpis.map((item) => (
              <Card
                key={item.label}
                className="border-slate-200 bg-white shadow-sm"
              >
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-slate-500">
                    {item.label}
                  </CardDescription>
                  <CardTitle className="text-3xl font-semibold text-slate-900">
                    {item.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </section>
        )}

        {/* Overdue table */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Overdue Tasks</CardTitle>
            <CardDescription>
              Tasks past their due date and not yet marked as done.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Site</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Due</th>
                </tr>
              </thead>
              <tbody>
                {overdue.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      <span className="text-sm text-slate-500">
                        No overdue tasks 🎉
                      </span>
                    </td>
                  </tr>
                ) : (
                  overdue.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3">{r.site ?? "—"}</td>
                      <td className="px-4 py-3">{r.unit ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">
                        {r.priority}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {r.status}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(r.due_at).toLocaleString()}
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
