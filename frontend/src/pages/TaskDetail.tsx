// src/pages/TaskDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getTask, updateTask, type Task } from "../services/tasks";

export default function TaskDetailPage() {
  const { id } = useParams();
  const taskId = Number(id);
  const location = useLocation();
  const backTo =
    (location.state as { from?: string } | undefined)?.from ?? "/tasks";

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const t = await getTask(taskId);
        setTask(t);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load task");
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId]);

  async function onStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!task) return;
    const status = e.target.value;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, { status });
      setTask(updated);
    } catch (e: any) {
      alert(e?.message ?? "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  if (!taskId) return <div>Missing task id.</div>;
  if (loading) return <div>Loading…</div>;
  if (err) return <div style={{ color: "#b91c1c" }}>{err}</div>;
  if (!task) return <div>Task not found.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <Link to={backTo} style={{ fontSize: 14 }}>
        ← Back to tasks
      </Link>

      <h1 style={{ fontSize: 26, margin: "12px 0" }}>{task.title}</h1>

      <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
        <strong>Status:</strong>{" "}
        <select value={task.status} onChange={onStatusChange} disabled={saving}>
          <option value="new">new</option>
          <option value="in_progress">in progress</option>
          <option value="awaiting_parts">awaiting parts</option>
          <option value="blocked">blocked</option>
          <option value="done">done</option>
          <option value="cancelled">cancelled</option>
        </select>
      </p>

      <p style={{ margin: "4px 0", fontSize: 14 }}>
        <strong>Priority:</strong> {task.priority}
      </p>
      {task.assignee && (
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          <strong>Assignee:</strong> @{task.assignee}
        </p>
      )}
      {task.due_at && (
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          <strong>Due:</strong> {new Date(task.due_at).toLocaleString()}
        </p>
      )}

      {task.site && (
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          <strong>Site:</strong> {task.site.name} (id {task.site.id})
        </p>
      )}
      {task.unit && (
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          <strong>Unit:</strong> {task.unit.name} (id {task.unit.id})
        </p>
      )}

      {task.description && (
        <>
          <h2 style={{ marginTop: 20, fontSize: 18 }}>Description</h2>
          <p>{task.description}</p>
        </>
      )}
    </div>
  );
}
