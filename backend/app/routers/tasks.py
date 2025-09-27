from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Body, Form
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from ..db import get_session
from ..models import Task, TaskComment
from ..schemas import TaskCreate, TaskUpdate, CommentCreate

router = APIRouter(prefix="/tasks", tags=["tasks"])

def _coerce_dt(dt):
    if dt is None or isinstance(dt, datetime): return dt
    if isinstance(dt, str):
        v = dt.replace("Z", "+00:00")
        d = datetime.fromisoformat(v)
        if d.tzinfo: d = d.astimezone(timezone.utc).replace(tzinfo=None)
        return d
    return dt

@router.get("/", response_model=List[Task])
def list_tasks(session: Session = Depends(get_session), site_id: int | None = None):
    q = select(Task)
    if site_id is not None:
        q = q.where(Task.site_id == site_id)
    return session.exec(q.order_by(Task.created_at.desc())).all()

@router.post("/", response_model=Task)
def create_task(data: TaskCreate, session: Session = Depends(get_session)):
    payload = data.model_dump()
    payload["due_at"] = _coerce_dt(payload.get("due_at"))
    t = Task(**payload)
    session.add(t); session.commit(); session.refresh(t)
    return t

@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    return t

@router.put("/{task_id}", response_model=Task)
@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: int, data: TaskUpdate, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    payload = data.model_dump(exclude_unset=True)
    if "due_at" in payload:
        payload["due_at"] = _coerce_dt(payload["due_at"])
    for k, v in payload.items():
        setattr(t, k, v)
    t.updated_at = datetime.utcnow()
    session.add(t); session.commit(); session.refresh(t)
    return t

@router.delete("/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    session.delete(t); session.commit()
    return {"ok": True}

# ------- comments -------
@router.get("/{task_id}/comments", response_model=List[TaskComment])
def list_comments(task_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(TaskComment).where(TaskComment.task_id == task_id).order_by(TaskComment.created_at.asc())
    ).all()

@router.post("/{task_id}/comments", response_model=TaskComment)
async def add_comment(
    task_id: int,
    body: str = Form(...),
    author: Optional[str] = Form(None),
    session: Session = Depends(get_session),
):
    c = TaskComment(task_id=task_id, body=body, author=author)
    session.add(c); session.commit(); session.refresh(c)
    return c

@router.put("/comments/{comment_id}", response_model=TaskComment)
@router.patch("/comments/{comment_id}", response_model=TaskComment)
def edit_comment(comment_id: int, data: CommentCreate, session: Session = Depends(get_session)):
    c = session.get(TaskComment, comment_id)
    if not c: raise HTTPException(404, "Comment not found")
    payload = data.model_dump(exclude_unset=True)
    for k, v in payload.items():
        setattr(c, k, v)
    session.add(c); session.commit(); session.refresh(c)
    return c

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, session: Session = Depends(get_session)):
    c = session.get(TaskComment, comment_id)
    if not c: raise HTTPException(404, "Comment not found")
    session.delete(c); session.commit()
    return {"ok": True}
