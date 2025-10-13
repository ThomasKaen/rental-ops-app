from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Dict, Any

import sqlalchemy as sa
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..db import get_session
from ..models import Task, Status, Priority
from ..services.recurrence import next_due, within_until

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _task_to_dict(t: Task) -> Dict[str, Any]:
    return {
        "id": t.id,
        "title": t.title,
        "site_id": t.site_id,
        "unit_id": t.unit_id,
        "status": getattr(t.status, "value", t.status),
        "priority": getattr(t.priority, "value", t.priority),
        "due_at": t.due_at,
        "is_recurring": t.is_recurring,
        "recurrence": t.recurrence,
        "recur_interval": t.recur_interval,
        "recur_dow": t.recur_dow,
        "recur_dom": t.recur_dom,
        "recur_until": t.recur_until,
        "last_scheduled_at": t.last_scheduled_at,
    }

@router.get("/preview", response_model=List[Dict[str, Any]])
def preview_materialization(
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Read-only preview of what would be created if we materialize now.
    """
    now = _utc_now()
    bases: List[Task] = session.exec(
        select(Task).where(
            Task.is_recurring == True,
            Task.recurrence.is_not(None),
            Task.due_at.is_not(None),
            Task.status != Status.done,  # ignore archived templates
        )
    ).all()

    preview: List[Dict[str, Any]] = []
    for base in bases:
        # Guard: if we already advanced this cycle, skip
        if base.last_scheduled_at and base.due_at and base.last_scheduled_at >= base.due_at:
            continue

        if base.due_at and base.due_at <= now:
            nd = next_due(
                due_at=base.due_at,
                recurrence=base.recurrence,
                recur_interval=base.recur_interval,
                recur_dow=base.recur_dow,
                recur_dom=base.recur_dom,
            )
            if within_until(nd, base.recur_until):
                preview.append({
                    "template": _task_to_dict(base),
                    "will_create": {
                        "title": base.title,
                        "site_id": base.site_id,
                        "unit_id": base.unit_id,
                        "priority": getattr(base.priority, "value", base.priority),
                        "due_at": nd,
                    },
                    "will_advance_template_to": nd,
                })

    return preview

@router.post("/materialize")
def materialize_recurring(
    session: Session = Depends(get_session),
    limit: int = Query(100, ge=1, le=1000),
) -> Dict[str, int]:
    """
    Create the next occurrence for each due recurring task and advance the template's due_at.
    Idempotent per-cycle using last_scheduled_at guard.
    """
    now = _utc_now()
    created = 0

    bases: List[Task] = session.exec(
        select(Task).where(
            Task.is_recurring == True,
            Task.recurrence.is_not(None),
            Task.due_at.is_not(None),
            Task.status != Status.done,
        ).order_by(Task.due_at.asc())
    ).all()

    for base in bases:
        if created >= limit:
            break

        # Skip if already materialized for current cycle
        if base.last_scheduled_at and base.due_at and base.last_scheduled_at >= base.due_at:
            continue

        if base.due_at and base.due_at <= now:
            nd = next_due(
                due_at=base.due_at,
                recurrence=base.recurrence,
                recur_interval=base.recur_interval,
                recur_dow=base.recur_dow,
                recur_dom=base.recur_dom,
            )
            if not within_until(nd, base.recur_until):
                # mark as advanced but no further schedules ahead; stop advancing template
                base.last_scheduled_at = now
                session.add(base)
                continue

            # Create occurrence as a normal task
            occ = Task(
                site_id=base.site_id,
                unit_id=base.unit_id,
                title=base.title,
                description=base.description,
                priority=base.priority if isinstance(base.priority, Priority) else Priority.green,
                status=Status.new,
                assignee=base.assignee,
                due_at=nd,
                is_recurring=False,
                recurrence=None,
                recur_interval=None,
                recur_dow=None,
                recur_dom=None,
                recur_until=None,
                last_scheduled_at=None,
            )
            session.add(occ)

            # Advance the template forward one cycle
            base.due_at = nd
            base.last_scheduled_at = now
            session.add(base)
            created += 1

    session.commit()
    return {"created": created}
