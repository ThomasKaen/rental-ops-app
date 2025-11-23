// src/services/maintenance.ts
import api from "../lib/api";

export type TemplateInfo = {
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

export type WillCreate = {
  title: string;
  site_id: number;
  unit_id: number | null;
  priority: string;
  due_at: string;
};

export type PreviewRow = {
  template: TemplateInfo;
  will_create: WillCreate;
  will_advance_template_to: string;
};

export async function getMaintenancePreview(): Promise<PreviewRow[]> {
  const res = await api.get<PreviewRow[]>("maintenance/preview");
  return res.data ?? [];
}

export async function materializeMaintenance(): Promise<number> {
  const res = await api.post<{ created: number }>(
    "maintenance/materialize"
  );
  return res.data.created;
}
