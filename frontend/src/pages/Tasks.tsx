import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import NewTaskModal from "../components/NewTaskModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  listTasksByQuery,
  listTaskSites,
  listUnitsForSite,
  type Task,
  type SiteRef,
  type UnitRef,
} from "../services/tasks";

const STATUS_OPTIONS = [
  "new",
  "in_progress",
  "awaiting_parts",
  "blocked",
  "done",
  "cancelled",
] as const;

function chipClass(active: boolean) {
  return [
    "inline-flex items-center rounded-full border px-3 py-1 text-xs capitalize",
    active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700",
  ].join(" ");
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [q, setQ] = useState("");

  // site/unit filters
  const [sites, setSites] = useState<SiteRef[]>([]);
  const [units, setUnits] = useState<UnitRef[]>([]);
  const [siteId, setSiteId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");

  const location = useLocation();

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_OPTIONS) counts[s] = 0;
    for (const t of tasks)
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [tasks]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (priority) p.set("priority", priority);
    if (status) p.set("status", status);
    if (assignee) p.set("assignee", assignee);
    if (siteId !== "") p.set("site_id", String(siteId));
    if (unitId !== "") p.set("unit_id", String(unitId));
    if (overdue) p.set("overdue", "true");
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [priority, status, assignee, siteId, unitId, overdue, q]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await listTasksByQuery(qs);
      setTasks(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [qs]);

  // load sites
  useEffect(() => {
    (async () => {
      try {
        const data = await listTaskSites();
        setSites(data);
      } catch {
        // ignore small filter errors
      }
    })();
  }, []);

  // load units when site changes
  useEffect(() => {
    (async () => {
      if (siteId !== "") {
        try {
          const data = await listUnitsForSite(siteId as number);
          setUnits(data);
        } catch {
          setUnits([]);
        }
      } else {
        setUnits([]);
        setUnitId("");
      }
    })();
  }, [siteId]);

  const clearFilters = () => {
    setPriority("");
    setStatus("");
    setAssignee("");
    setSiteId("");
    setUnitId("");
    setOverdue(false);
    setQ("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tasks
            </h1>
            <p className="text-sm text-slate-500">
              Filter and manage maintenance tasks.
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            + New Task
          </Button>
        </header>

        {/* Filters */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Priority (all)</option>
              <option value="red">Red</option>
              <option value="amber">Amber</option>
              <option value="green">Green</option>
            </select>

            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus("")}
                className={chipClass(status === "")}
              >
                All ({tasks.length})
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={chipClass(status === s)}
                >
                  {s.replace("_", " ")} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Assignee"
              className="h-9 w-40"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />

            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={String(siteId)}
              onChange={(e) =>
                setSiteId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
            >
              <option value="">All sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={String(unitId)}
              onChange={(e) =>
                setUnitId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              disabled={siteId === ""}
            >
              <option value="">
                {siteId === "" ? "Select site first" : "All units"}
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-1 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={overdue}
                onChange={(e) => setOverdue(e.target.checked)}
              />
              Overdue
            </label>

            <Input
              placeholder="Search title/desc"
              className="h-9 flex-1 min-w-[160px]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {(priority ||
              status ||
              assignee ||
              siteId !== "" ||
              unitId !== "" ||
              overdue ||
              q) && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-sm text-slate-500">Loading…</div>
        )}
        {err && <div className="text-sm text-red-600">{err}</div>}
        {!loading && tasks.length === 0 && (
          <div className="text-sm text-slate-500">
            No tasks match.
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((t) => (
            <Link
              key={t.id}
              to={`/tasks/${t.id}`}
              state={{ from: location.pathname + location.search }}
              className="block rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm no-underline hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      t.priority === "red"
                        ? "bg-red-600"
                        : t.priority === "amber"
                        ? "bg-amber-500"
                        : "bg-green-600"
                    }`}
                  />
                  <span className="truncate font-medium">
                    {t.title}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {t.assignee ? `@${t.assignee}` : ""}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize">
                  {t.status.replace("_", " ")}
                </span>
                <span>
                  {t.due_at
                    ? new Date(t.due_at).toLocaleString()
                    : "No due date"}
                </span>
                {isOverdue(t) && (
                  <span className="font-medium text-red-600">
                    Overdue
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <NewTaskModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => load()}
        />
      </div>
    </div>
  );
}

function isOverdue(t: Task) {
  if (!t.due_at) return false;
  if (t.status === "done" || t.status === "cancelled") return false;
  return new Date(t.due_at).getTime() < Date.now();
}
