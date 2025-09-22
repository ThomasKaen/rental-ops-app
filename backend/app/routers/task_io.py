from fastapi import APIRouter, Request, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from pathlib import Path
from typing import List
from ..db import get_session
from ..models import Task, TaskComment, TaskAttachment

router = APIRouter(prefix="/tasks", tags=["task-io"])

@router.get("/{task_id}/comments", response_model=List[TaskComment])
def list_comments(task_id: int, session: Session = Depends(get_session)):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    q = select(TaskComment).where(TaskComment.task_id == task_id).order_by(TaskComment.created_at)
    return session.exec(q).all()

@router.post("/{task_id}/comments", response_model=TaskComment)
def add_comment(
    task_id: int,
    body: str = Form(...),
    author: str | None = Form(default=None),
    session: Session = Depends(get_session),
):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    c = TaskComment(task_id=task_id, body=body, author=author)
    session.add(c); session.commit(); session.refresh(c)
    return c

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/{task_id}/attachments", response_model=TaskAttachment)
def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    request: Request = None,
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    # safe filename
    safe = f"{task_id}_{file.filename.replace('/', '_')}"
    dest = UPLOAD_DIR / safe
    with dest.open("wb") as f:
        f.write(file.file.read())

    # build absolute URL using API base
    base_url = str(request.base_url).rstrip("/") if request else ""
    public_path = f"/uploads/{safe}"
    full_url = f"{base_url}{public_path}"

    att = TaskAttachment(task_id=task_id, filename=file.filename, url=full_url)
    session.add(att)
    session.commit()
    session.refresh(att)
    return att

@router.get("/{task_id}/attachments", response_model=List[TaskAttachment])
def list_attachments(task_id: int, session: Session = Depends(get_session)):
    if not session.get(Task, task_id):
        raise HTTPException(404, "Task not found")
    q = select(TaskAttachment).where(TaskAttachment.task_id == task_id).order_by(TaskAttachment.uploaded_at)
    return session.exec(q).all()
