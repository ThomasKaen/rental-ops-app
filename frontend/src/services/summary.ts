// src/services/summary.ts
import api from "../lib/api";

export type KPI = {
  sites: number;
  units: number;
  open_tasks: number;
  overdue: number;
  due_today: number;
  due_this_week: number;
};

export type Summary = {
  kpis: KPI;
};

export type OverdueRow = {
  id: number;
  title: string;
  due_at: string;
  priority: string;
  status: string;
  site: string | null;
  unit: string | null;
};

export async function getSummaryAndOverdue(): Promise<{
  summary: Summary;
  overdue: OverdueRow[];
}> {
  const [sRes, oRes] = await Promise.all([
    api.get<Summary>("/summary/"),
    api.get<OverdueRow[]>("/summary/overdue/"),
  ]);

  return {
    summary: sRes.data,
    overdue: oRes.data ?? [],
  };
}
