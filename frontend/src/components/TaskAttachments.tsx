// src/components/TaskAttachments.tsx
import { useEffect, useState } from "react";
import {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
  type TaskAttachment,
} from "../services/task_io";

import { Button } from "./ui/button";

type Props = {
  taskId: number;
};

export default function TaskAttachments({ taskId }: Props) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAttachments(taskId);
      // newest first
      setAttachments(
        [...data].sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        )
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to load attachments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const att = await uploadAttachment(taskId, file);
      setAttachments((prev) => [att, ...prev]);
      e.target.value = "";
    } catch (er: any) {
      setError(
        er?.response?.data?.detail ??
          er?.message ??
          "Failed to upload attachment"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (att: TaskAttachment) => {
    if (!confirm("Delete this file?")) return;
    try {
      await deleteAttachment(taskId, att.id);
      setAttachments((prev) => prev.filter((x) => x.id !== att.id));
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          e?.message ??
          "Failed to delete attachment"
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* upload */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <span className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs">
            Choose file
          </span>
          <input
            type="file"
            className="hidden"
            onChange={onFileChange}
          />
        </label>

        {uploading && (
          <span className="text-xs text-slate-500">
            Uploading…
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* list */}
      <div className="space-y-2">
        {loading && (
          <p className="text-xs text-slate-500">
            Loading attachments…
          </p>
        )}
        {!loading && attachments.length === 0 && (
          <p className="text-xs text-slate-500">
            No attachments yet.
          </p>
        )}

        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <a
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sky-700 hover:underline"
              >
                {att.filename}
              </a>
              <p className="text-[11px] text-slate-500">
                {new Date(att.uploaded_at).toLocaleString()}
              </p>
            </div>

            <button
              className="text-[11px] text-slate-400 hover:text-red-500"
              onClick={() => handleDelete(att)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
