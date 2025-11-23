// src/components/Comments.tsx
import { useEffect, useState } from "react";
import {
  listComments,
  addComment,
  deleteComment,
  type TaskComment,
} from "../services/task_io";

import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

type Props = {
  taskId: number;
};

export default function Comments({ taskId }: Props) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listComments(taskId);
      // newest first
      setComments(
        [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to load comments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setError(null);
    try {
      const c = await addComment(taskId, text);
      setBody("");
      setComments((prev) => [c, ...prev]);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to add comment"
      );
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (c: TaskComment) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(taskId, c.id);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to delete comment"
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* form */}
      <div className="space-y-2">
        <Textarea
          rows={3}
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex items-center justify-between gap-2">
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
          <Button
            size="sm"
            className="ml-auto"
            disabled={posting || !body.trim()}
            onClick={submit}
          >
            {posting ? "Posting…" : "Add Comment"}
          </Button>
        </div>
      </div>

      {/* list */}
      <div className="space-y-2">
        {loading && (
          <p className="text-xs text-slate-500">Loading comments…</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-slate-500">
            No comments yet. Be the first.
          </p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                {c.author || "System"}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-slate-800">
              {c.body}
            </p>
            <div className="mt-1 flex justify-end">
              <button
                className="text-[11px] text-slate-400 hover:text-red-500"
                onClick={() => handleDelete(c)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
