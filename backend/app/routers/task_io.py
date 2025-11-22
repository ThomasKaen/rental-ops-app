from pathlib import Path
from typing import List

from fastapi import APIRouter, Request, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..models import Task, TaskComment, TaskAttachment

router = APIRouter(prefix="/tasks", tags=["task-io"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get("/{task_id}/comments")
def list_comments(task_id: int, session: Session = Depends(get_session)):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    q = (
        select(TaskComment)
        .where(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at)
    )
    return session.exec(q).all()


@router.post("/{task_id}/comments")
def add_comment(
    task_id: int,
    body: str = Form(...),
    author: str | None = Form(default=None),
    session: Session = Depends(get_session),
):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    c = TaskComment(task_id=task_id, body=body, author=author)
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


@router.post("/{task_id}/attachments")
def upload_attachment(
    task_id: int,
    request: Request,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    safe = f"{task_id}_{file.filename.replace('/', '_')}"
    dest = UPLOAD_DIR / safe
    with dest.open("wb") as f:
        f.write(file.file.read())

    base_url = str(request.base_url).rstrip("/") if request else ""
    public_path = f"/uploads/{safe}"
    full_url = f"{base_url}{public_path}"

    att = TaskAttachment(task_id=task_id, filename=file.filename, url=full_url)
    session.add(att)
    session.commit()
    session.refresh(att)
    return att


@router.get("/{task_id}/attachments")
def list_attachments(task_id: int, session: Session = Depends(get_session)):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    q = (
        select(TaskAttachment)
        .where(TaskAttachment.task_id == task_id)
        .order_by(TaskAttachment.uploaded_at)
    )
    return session.exec(q).all()


# --- Comments update & delete ---


class CommentUpdate(BaseModel):
    body: str
    author: str | None = None


@router.patch("/{task_id}/comments/{comment_id}")
def update_comment(
    task_id: int,
    comment_id: int,
    payload: CommentUpdate,
    session: Session = Depends(get_session),
):
    c = session.get(TaskComment, comment_id)
    if not c or c.task_id != task_id:
        raise HTTPException(404, "Comment not found")
    c.body = payload.body
    if payload.author is not None:
        c.author = payload.author
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


@router.delete("/{task_id}/comments/{comment_id}", status_code=204)
def delete_comment(
    task_id: int,
    comment_id: int,
    session: Session = Depends(get_session),
):
    c = session.get(TaskComment, comment_id)
    if not c or c.task_id != task_id:
        raise HTTPException(404, "Comment not found")
    session.delete(c)
    session.commit()
    return
