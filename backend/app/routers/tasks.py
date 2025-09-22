from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from ..db import get_session
from ..models import Task
from ..schemas import TaskCreate, TaskPatch


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
def list_tasks(
    site_id: int | None = None,
    priority: str | None = None,
    status: str | None = None,
    assignee: str | None = None,
    overdue: bool | None = None,
    q: str | None = None,
    session: Session = Depends(get_session),
):
    from ..models import Task  # ensure Task is imported
    statement = select(Task)
    if site_id:
        statement = statement.where(Task.site_id == site_id)
    if priority:
        statement = statement.where(Task.priority == priority)
    if status:
        statement = statement.where(Task.status == status)
    if assignee is not None and assignee != "":
        statement = statement.where(Task.assignee == assignee)
    if q:
        like = f"%{q}%"
        statement = statement.where((Task.title.like(like)) | (Task.description.like(like)))
    if overdue:
        # overdue = due_at in past AND not done/cancelled
        from datetime import datetime
        statement = statement.where(
            Task.due_at.is_not(None),
            Task.due_at < datetime.utcnow(),
            Task.status.not_in(["done", "cancelled"]),
        )
    return session.exec(statement.order_by(Task.created_at.desc())).all()

@router.post("")
def create_task(payload: TaskCreate, session: Session = Depends(get_session)):
    t = Task(**payload.model_dump())
    session.add(t)
    session.commit()
    session.refresh(t)
    return t


@router.get("/{task_id}")
def get_task(task_id: int, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t:
        raise HTTPException(404, "Task not found")
    return t

@router.patch("/{task_id}")
def update_task(task_id: int, payload: TaskPatch, session: Session = Depends(get_session)):
    t = session.get(Task, task_id)
    if not t:
        raise HTTPException(404, "Task not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(t, k, v)
    t.updated_at = datetime.utcnow()
    session.add(t)
    session.commit()
    session.refresh(t)
    return t
