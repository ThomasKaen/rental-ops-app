import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TaskAttachments from "../components/TaskAttachments";

import Comments from "../components/Comments";
import {
  isoToLocal,
  localToISO,
  prettyDate,
} from "../lib/datetime";

import {
  getTask,
  updateTaskStatus,
  updateTaskAssignee,
  updateTaskDue,
  deleteTask as deleteTaskApi,
  type TaskDetail as Task,
} from "../services/tasks";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [pending, setPending] =
    useState<null | "status" | "assignee" | "due">(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    getTask(Number(id))
      .then((t) => {
        setTask(t);
        setAssignee(t.assignee || "");
        setDueLocal(isoToLocal(t.due_at));
      })
      .catch((e: any) =>
        setErr(
          e?.response?.data?.detail ??
            e?.message ??
            "Failed to load task"
        )
      );
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!task)
    return (
      <div className="p-4 text-sm text-slate-500">
        {err ?? "Loading…"}
      </div>
    );

  const backHref = task.site_id
    ? `/tasks?site_id=${task.site_id}${
        task.unit_id ? `&unit_id=${task.unit_id}` : ""
      }`
    : "/tasks";

  async function optimistic(
    label: "status" | "assignee" | "due",
    apply: (t: Task) => Task,
    request: () => Promise<unknown>
  ) {
    if (!task) return;
    setPending(label);
    setErr(null);

    const prev = task;
    const next = apply({ ...task });
    setTask(next);

    try {
      await request();
    } catch (e: any) {
      setTask(prev);
      setErr(
        e?.response?.data?.detail ??
          e?.message ??
          "Update failed"
      );
    } finally {
      setPending(null);
    }
  }

  const updateStatusHandler = (status: string) =>
    optimistic(
      "status",
      (d) => ({ ...d, status }),
      () => updateTaskStatus(Number(id), status)
    );

  const saveAssignee = () =>
    optimistic(
      "assignee",
      (d) => ({ ...d, assignee: assignee || null }),
      () => updateTaskAssignee(Number(id), assignee || null)
    );

  const saveDue = () =>
    optimistic(
      "due",
      (d) => ({ ...d, due_at: localToISO(dueLocal) }),
      () => updateTaskDue(Number(id), localToISO(dueLocal))
    );

  const clearDue = () =>
    optimistic(
      "due",
      (d) => ({ ...d, due_at: null }),
      () => updateTaskDue(Number(id), null)
    );

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    await deleteTaskApi(Number(id));
    window.location.href = backHref;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* HEADER */}
        <Card className="border-slate-200">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {task.description}
                </p>
              )}
            </div>
            <a href={backHref}>
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </a>
          </CardHeader>
        </Card>

        {/* ASSIGNEE */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Assignee</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Input
              value={assignee}
              placeholder="Assignee (e.g. tamas)"
              className="max-w-xs"
              onChange={(e) => setAssignee(e.target.value)}
            />
            <Button
              size="sm"
              disabled={pending === "assignee"}
              onClick={saveAssignee}
            >
              {assignee ? "Assign" : "Unassign"}
            </Button>
          </CardContent>
        </Card>

        {/* DUE DATE */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Due Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>Current:</strong>{" "}
              {prettyDate(task.due_at) || "—"}
              {isOverdue(task) && (
                <span className="text-red-600"> · Overdue</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="datetime-local"
                value={dueLocal}
                onChange={(e) => setDueLocal(e.target.value)}
                className="max-w-xs"
              />
              <Button
                size="sm"
                disabled={pending === "due"}
                onClick={saveDue}
              >
                Save
              </Button>
              {task.due_at && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending === "due"}
                  onClick={clearDue}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* STATUS CONTROLS */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending === "status"}
              onClick={() => updateStatusHandler("in_progress")}
            >
              Start
            </Button>
            <Button
              size="sm"
              disabled={pending === "status"}
              onClick={() => updateStatusHandler("awaiting_parts")}
            >
              Awaiting Parts
            </Button>
            <Button
              size="sm"
              disabled={pending === "status"}
              onClick={() => updateStatusHandler("done")}
            >
              Done
            </Button>

            <Button
              size="sm"
              className="ml-auto bg-red-600 text-white hover:bg-red-700"
              onClick={deleteTask}
            >
              Delete Task
            </Button>
          </CardContent>
        </Card>

        {/* COMMENTS */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Comments taskId={Number(id)} />
          </CardContent>
        </Card>

        {/*ATTACHMENTS*/}
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
                <TaskAttachments taskId={Number(id)} />
            </CardContent>
        </Card>

        {err && (
          <p className="text-sm text-red-600 text-center">{err}</p>
        )}
      </div>
    </div>
  );
}

function isOverdue(task: { due_at?: string | null; status: string }) {
  if (!task.due_at) return false;
  if (task.status === "done" || task.status === "cancelled") return false;
  return new Date(task.due_at).getTime() < Date.now();
}
