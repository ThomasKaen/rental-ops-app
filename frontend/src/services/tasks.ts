// src/services/tasks.ts
import api from "../lib/api";

export const STATUS_OPTIONS = [
  "new",
  "in_progress",
  "awaiting_parts",
  "blocked",
  "done",
  "cancelled",
] as const;

export type StatusVal = (typeof STATUS_OPTIONS)[number];
export type TaskPriority = "red" | "amber" | "green";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  site?: { id: number; name: string };
  unit?: { id: number; name: string };
  priority: TaskPriority;
  status: StatusVal;
  assignee?: string;
  due_at?: string | null;
}

export async function listTasks(qs: string = ""): Promise<Task[]> {
  const suffix = qs
    ? qs.startsWith("?")
      ? qs
      : `?${qs}`
    : "";
  return api.get<Task[]>(`tasks${suffix}`);
}

export async function getTask(id: number): Promise<Task> {
  return api.get<Task>(`tasks/${id}`);
}

export async function createTask(payload: Partial<Task>): Promise<Task> {
  return api.post<Task>("tasks", payload);
}

export async function updateTask(
  id: number,
  payload: Partial<Task>
): Promise<Task> {
  return api.patch<Task>(`tasks/${id}`, payload);
}
