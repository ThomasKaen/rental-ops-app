// src/services/maintenance.ts
import api from "../lib/api";

export type MaintenancePreview = {
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

export async function previewMaintenance(): Promise<MaintenancePreview[]> {
  return api.get<MaintenancePreview[]>("maintenance/preview");
}

export async function materializeMaintenance(): Promise<{ created: number }> {
  return api.post<{ created: number }>("maintenance/materialize");
}
