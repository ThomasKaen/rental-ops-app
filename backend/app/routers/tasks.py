from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from ..db import get_session
from ..models import Task, Status  # Task model with enums

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[Task])
def list_tasks(
    session: Session = Depends(get_session),
    priority: Optional[str] = Query(None),
    status_: Optional[str] = Query(None, alias="status"),
    assignee: Optional[str] = Query(None),
    site_id: Optional[int] = Query(None),
    unit_id: Optional[int] = Query(None),
    overdue: bool = Query(False),
    q: Optional[str] = Query(None),
) -> List[Task]:
    """
    List tasks, with simple filters used by the Tasks page.
    All filters are optional.
    """
    stmt = select(Task)

    if priority:
        stmt = stmt.where(Task.priority == priority)

    if status_:
        stmt = stmt.where(Task.status == status_)

    if assignee:
        stmt = stmt.where(Task.assignee == assignee)

    if site_id is not None:
        stmt = stmt.where(Task.site_id == site_id)

    if unit_id is not None:
        stmt = stmt.where(Task.unit_id == unit_id)

    if overdue:
        now = datetime.now(timezone.utc)
        stmt = stmt.where(
            Task.due_at.is_not(None),
            Task.due_at < now,
            Task.status != Status.done,
            Task.status != Status.cancelled,
        )

    tasks = session.exec(stmt).all()

    # text search in Python – fine for small datasets
    if q:
        q_lower = q.lower()
        tasks = [
            t
            for t in tasks
            if (t.title and q_lower in t.title.lower())
            or (getattr(t, "description", None) and q_lower in t.description.lower())
        ]

    return tasks


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: Task, session: Session = Depends(get_session)) -> Task:
    """Create a new task."""
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session)) -> Task:
    """Get a task by id."""
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    partial: Task,  # still using the SQLModel here; exclude_unset handles patch semantics
    session: Session = Depends(get_session),
) -> Task:
    """Update an existing task (partial patch)."""

    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = partial.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: Session = Depends(get_session)) -> None:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
