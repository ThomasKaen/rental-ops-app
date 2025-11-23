// src/services/task_io.ts
import api from "../lib/api";

export type TaskComment = {
  id: number;
  task_id: number;
  author?: string | null;
  body: string;
  created_at: string;
};

export type TaskAttachment = {
  id: number;
  task_id: number;
  filename: string;
  url: string;
  uploaded_at: string;
};

// ------- Comments -------

export async function listComments(
  taskId: number
): Promise<TaskComment[]> {
  const res = await api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
  return res.data ?? [];
}

export async function addComment(
  taskId: number,
  body: string,
  author?: string | null
): Promise<TaskComment> {
  const res = await api.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    {
      body,
      author: author ?? null,
    }
  );
  return res.data;
}

export async function deleteComment(
  taskId: number,
  commentId: number
): Promise<void> {
  await api.delete(`/tasks/${taskId}/comments/${commentId}`);
}

// ------- Attachments -------

export async function listAttachments(
  taskId: number
): Promise<TaskAttachment[]> {
  const res = await api.get<TaskAttachment[]>(
    `/tasks/${taskId}/attachments`
  );
  return res.data ?? [];
}

export async function uploadAttachment(
  taskId: number,
  file: File
): Promise<TaskAttachment> {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post<TaskAttachment>(
    `/tasks/${taskId}/attachments`,
    form
    // axios will set multipart/form-data automatically for FormData
  );
  return res.data;
}

export async function deleteAttachment(
  taskId: number,
  attachmentId: number
): Promise<void> {
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
}
