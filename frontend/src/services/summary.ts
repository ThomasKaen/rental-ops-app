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
  by_status: { status: string; count: number }[];
  by_site: { site: string | null; cnt: number }[];
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

export async function getDashboardSummary(): Promise<Summary> {
  return api.get<Summary>("summary");
}

export async function getOverdueTasks(): Promise<OverdueRow[]> {
  return api.get<OverdueRow[]>("summary/overdue");
}
