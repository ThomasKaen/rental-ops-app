// src/services/tasks.ts
import api from "../lib/api";

// ---- types ----

export type TaskStatus =
  | "new"
  | "in_progress"
  | "awaiting_parts"
  | "blocked"
  | "done"
  | "cancelled";

export type TaskPriority = "red" | "amber" | "green";

export type TaskListItem = {
  id: number;
  title: string;
  site?: { id: number; name: string } | null;
  unit?: { id: number; name: string } | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string | null;
  due_at?: string | null;
};

export type TaskDetail = TaskListItem & {
  description?: string | null;
  site_id?: number | null;
  unit_id?: number | null;
};

export type SiteRef = { id: number; name: string };
export type UnitRef = { id: number; site_id: number; name: string };

// ---- filters for list ----

export type TaskFilter = {
  priority?: TaskPriority | "";
  status?: TaskStatus | "";
  assignee?: string;
  site_id?: number | "";
  unit_id?: number | "";
  overdue?: boolean;
  q?: string;
};

function buildQuery(filter: TaskFilter): string {
  const p = new URLSearchParams();
  if (filter.priority) p.set("priority", filter.priority);
  if (filter.status) p.set("status", filter.status);
  if (filter.assignee) p.set("assignee", filter.assignee);
  if (filter.site_id !== "" && filter.site_id != null) {
    p.set("site_id", String(filter.site_id));
  }
  if (filter.unit_id !== "" && filter.unit_id != null) {
    p.set("unit_id", String(filter.unit_id));
  }
  if (filter.overdue) p.set("overdue", "true");
  if (filter.q) p.set("q", filter.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ---- list endpoints ----

// used by Tasks.tsx (string-based query)
export async function listTasksByQuery(qs: string): Promise<TaskListItem[]> {
  const res = await api.get<TaskListItem[]>(`/tasks${qs}`);
  return res.data;
}

// optional: object-based filtering if you ever want it
export async function listTasks(filter: TaskFilter = {}): Promise<TaskListItem[]> {
  const qs = buildQuery(filter);
  return listTasksByQuery(qs);
}

// sites + units for filters
export async function listTaskSites(): Promise<SiteRef[]> {
  const res = await api.get<SiteRef[]>("/sites");
  return res.data;
}

export async function listUnitsForSite(siteId: number): Promise<UnitRef[]> {
  const res = await api.get<UnitRef[]>(`/sites/${siteId}/units/`);
  return res.data;
}

// ---- detail + mutations ----

export async function getTask(id: number): Promise<TaskDetail> {
  const res = await api.get<TaskDetail>(`/tasks/${id}`);
  return res.data;
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus
): Promise<TaskDetail> {
  const res = await api.patch<TaskDetail>(`/tasks/${id}`, { status });
  return res.data;
}

export async function updateTaskAssignee(
  id: number,
  assignee: string | null
): Promise<TaskDetail> {
  const res = await api.patch<TaskDetail>(`/tasks/${id}`, { assignee });
  return res.data;
}

export async function updateTaskDue(
  id: number,
  due_at: string | null
): Promise<TaskDetail> {
  const res = await api.patch<TaskDetail>(`/tasks/${id}`, { due_at });
  return res.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
