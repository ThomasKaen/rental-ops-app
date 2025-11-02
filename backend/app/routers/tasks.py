from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Body, Form
from typing import List, Optional, Dict, Any, Literal
from sqlmodel import Session, select
from pydantic import BaseModel, field_validator
from ..db import get_session
from ..models import Task, TaskComment, Priority, Status
from ..schemas import TaskCreate, TaskUpdate, CommentCreate

router = APIRouter(prefix="/tasks", tags=["tasks"])

Recurrence = Literal["daily","weekly","monthly","quarterly","yearly"]

class TaskIn(BaseModel):
    title: str
    description: Optional[str] = None
    site_id: int
    unit_id: Optional[int] = None
    priority: Optional[str] = None   # or enum type if you already use one
    status: Optional[str] = None     # or enum type if you already use one
    due_at: Optional[datetime] = None

    # recurrence inputs
    is_recurring: bool = False
    recurrence: Optional[Recurrence] = None
    recur_interval: Optional[int] = 1
    recur_dow: Optional[int] = None
    recur_dom: Optional[int] = None
    recur_until: Optional[datetime] = None

    @field_validator("recur_interval")
    @classmethod
    def _min_interval(cls, v):
        if v is not None and v < 1:
            return 1
        return v

    @field_validator("due_at", "recur_until")
    @classmethod
    def _ensure_tz(cls, v):
        if v and v.tzinfo is None:
            # force UTC if naive
            return v.replace(tzinfo=timezone.utc)
        return v

def _coerce_dt(dt):
    if dt is None or isinstance(dt, datetime): return dt
    if isinstance(dt, str):
        v = dt.replace("Z", "+00:00")
        d = datetime.fromisoformat(v)
        if d.tzinfo: d = d.astimezone(timezone.utc).replace(tzinfo=None)
        return d
    return dt

@router.get("", response_model=List[Task])
def list_tasks(session: Session = Depends(get_session), site_id: int | None = None):
    q = select(Task)
    if site_id is not None:
        q = q.where(Task.site_id == site_id)
    return session.exec(q.order_by(Task.created_at.desc())).all()

@router.post("", response_model=Task)
def create_task(payload: TaskIn, session: Session = Depends(get_session)):
    t = Task(
        title=payload.title,
        description=payload.description or "",
        site_id=payload.site_id,
        unit_id=payload.unit_id,
        priority=payload.priority or Priority.green,
        status=payload.status or Status.new,
        due_at=payload.due_at,
        # recurrence
        is_recurring=payload.is_recurring,
        recurrence=payload.recurrence,
        recur_interval=payload.recur_interval,
        recur_dow=payload.recur_dow,
        recur_dom=payload.recur_dom,
        recur_until=payload.recur_until,
    )
    session.add(t)
    session.commit()
    session.refresh(t)
    return t

@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    return t

@router.put("/{task_id}", response_model=Task)
@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: int, payload: TaskIn, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(t, k, v)

    session.add(t)
    session.commit()
    session.refresh(t)
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

@router.post("/tasks/{task_id}/make_recurring")
def make_recurring(task_id: int, rules: TaskIn, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    t.is_recurring = True
    t.recurrence = rules.recurrence
    t.recur_interval = rules.recur_interval or 1
    t.recur_dow = rules.recur_dow
    t.recur_dom = rules.recur_dom
    t.recur_until = rules.recur_until
    if rules.due_at:
        t.due_at = rules.due_at
    session.add(t)
    session.commit()
    session.refresh(t)
    return t