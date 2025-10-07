import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";   // ← add this
import api from "../lib/api";
import Comments from "../components/Comments";
import { isoToLocal, localToISO, prettyDate } from "../lib/datetime";


export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [pending, setPending] = useState<null | "status" | "assignee" | "due">(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () =>
    api.get(`/tasks/${id}`).then((r) => {
      setTask(r.data);
      setAssignee(r.data.assignee || "");
      setDueLocal(isoToLocal(r.data.due_at));
    });

  useEffect(() => { load(); }, [id]);

  if (!task) return <div>Loading...</div>;

  // Back target: prefer the task’s own site/unit (works even if opened in new tab)
  const backHref =
    task?.site_id
      ? `/tasks?site_id=${task.site_id}${task?.unit_id ? `&unit_id=${task.unit_id}` : ""}`
      : "/tasks";

  async function update(status: string) {
    await api.patch(`/tasks/${id}`, { status });
    await load();
  }

  async function saveAssignee() {
  await optimistic("assignee",
    d => ({ ...d, assignee: assignee || null }),
    () => api.patch(`/tasks/${id}`, { assignee: assignee || null })
  );
    }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    // plain redirect keeps things simple and avoids router hooks entirely
    window.location.href = backHref;
  }

  async function optimistic<T>(
  label: "status" | "assignee" | "due",
  apply: (draft: Task) => Task,
  request: () => Promise<T>
) {
  if (!task) return;
  setErr(null);
  setPending(label);
  const prev = task;
  const next = apply({ ...task });
  setTask(next);                    // instant UI
  try {
    await request();                // server commit
  } catch (e: any) {
    setTask(prev);                  // rollback
    setErr(e?.response?.data?.detail || e?.message || "Update failed");
  } finally {
    setPending(null);
  }
}

  return (
    <div style={{ paddingBottom: 80 }}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>

      {/* Back link (no router hooks needed) */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <a href={backHref}>&larr; Back</a>
      </div>

      {/* Assignee */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
        <input
          placeholder="Assignee (e.g. tamas)"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <button onClick={saveAssignee}>{assignee ? "Assign" : "Unassign"}</button>
      </div>

      {/* Due date */}
      <div style={{ display: "grid", gap: 8, margin: "8px 0" }}>
        <div>
          <strong>Due:</strong> {prettyDate(task.due_at)}
          {isOverdue(task) && <span style={{ color: "#dc2626" }}> · Overdue</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
          />
          <button disabled={pending==="due"} onClick={async () => {
          await optimistic("due",
            d => ({ ...d, due_at: localToISO(dueLocal) }),
            () => api.patch(`/tasks/${id}`, { due_at: localToISO(dueLocal) })
          );
        }}>Save due date</button>

        {task.due_at && (
          <button disabled={pending==="due"} onClick={async () => {
            await optimistic("due",
              d => ({ ...d, due_at: null }),
              () => api.patch(`/tasks/${id}`, { due_at: null })
            );
          }}>Clear due</button>
        )}
        </div>
      </div>

      {/* Status + Delete */}
      <p>
        Status: <strong>{task.status}</strong>
      </p>
      <div
        style={{
          position: "fixed",
          bottom: 56,
          left: 0,
          right: 0,
          display: "flex",
          gap: 8,
          padding: 8,
          background: "#fff",
          borderTop: "1px solid #eee",
        }}
      >
        <button disabled={pending==="status"} onClick={() =>
          optimistic("status", d => ({ ...d, status: "in_progress" }),
            () => api.patch(`/tasks/${id}`, { status: "in_progress" }))
        }>Start</button>

        <button disabled={pending==="status"} onClick={() =>
          optimistic("status", d => ({ ...d, status: "awaiting_parts" }),
            () => api.patch(`/tasks/${id}`, { status: "awaiting_parts" }))
        }>Awaiting parts</button>

        <button disabled={pending==="status"} onClick={() =>
          optimistic("status", d => ({ ...d, status: "done" }),
            () => api.patch(`/tasks/${id}`, { status: "done" }))
        }>Done</button>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={deleteTask} style={{ color: "#b91c1c" }}>
            Delete Task
          </button>
        </div>
      </div>

      <Comments taskId={Number(id)} />
    </div>
  );
}

function isOverdue(t: { due_at?: string | null; status: string }) {
  if (!t.due_at) return false;
  if (t.status === "done" || t.status === "cancelled") return false;
  return new Date(t.due_at).getTime() < Date.now();
}
