import { useEffect, useState } from "react";
import api from "../lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

type KPI = {
  sites: number; units: number; open_tasks: number;
  overdue: number; due_today: number; due_this_week: number;
};
type Summary = {
  kpis: KPI;
  by_status: { status: string; count: number }[];
  by_site: { site: string | null; cnt: number }[];
};
type OverdueRow = {
  id: number; title: string; due_at: string;
  priority: string; status: string; site: string | null; unit: string | null;
};

export default function Dashboard() {
  const [sum, setSum] = useState<Summary | null>(null);
  const [overdue, setOverdue] = useState<OverdueRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // NOTE: use the SAME base + path style as Tasks.tsx (e.g. "/tasks")
        const [s, o] = await Promise.all([
          api.get<Summary>("/summary"),
          api.get<OverdueRow[]>("/summary/overdue"),
        ]);
        setSum(s.data);
        setOverdue(o.data);
      } catch (e: any) {
        setError(e?.response?.data ?? e?.message ?? "Failed to load dashboard");
      }
    })();
  }, []);

  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  if (!sum) return <div className="p-6 opacity-70">Loading dashboard…</div>;

  const k = sum.kpis;
  const kpis: [string, number][] = [
    ["Sites", k.sites], ["Units", k.units], ["Open Tasks", k.open_tasks],
    ["Overdue", k.overdue], ["Due Today", k.due_today], ["Due This Week", k.due_this_week],
  ];

  return (
    <div className="p-6 space-y-8">
      <header><h1 className="text-2xl font-semibold">Dashboard</h1></header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map(([label, val]) => (
          <div key={label} className="rounded-2xl shadow p-4">
            <div className="text-xs uppercase opacity-60">{label}</div>
            <div className="text-3xl font-bold">{val}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl shadow p-4">
          <h2 className="mb-2 font-medium">Open Tasks by Status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={sum.by_status}>
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl shadow p-4">
          <h2 className="mb-2 font-medium">Open Tasks by Site</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="cnt" data={sum.by_site} nameKey="site" outerRadius="80%" label>
                  {sum.by_site.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl shadow">
        <div className="p-4 border-b">
          <h2 className="font-medium">Overdue Tasks</h2>
          <p className="text-xs opacity-60">Tasks past due and not done</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Site</th>
                <th className="text-left px-4 py-2">Unit</th>
                <th className="text-left px-4 py-2">Priority</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {overdue.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={6}><span className="opacity-60">No overdue tasks 🎉</span></td></tr>
              ) : overdue.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">{r.site ?? "—"}</td>
                  <td className="px-4 py-3">{r.unit ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{r.priority}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">{new Date(r.due_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
