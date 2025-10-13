from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..models import Site, Unit, Task, Status

router = APIRouter(prefix="/summary", tags=["summary"])

def _count(session: Session, stmt) -> int:
    """Return an int count regardless of backend returning int or (int,) tuple."""
    res = session.exec(stmt)
    try:
        v = res.one()
    except Exception:
        v = res.first()
    if isinstance(v, tuple):
        v = v[0]
    return int(v or 0)

@router.get("/")
def get_summary(session: Session = Depends(get_session)) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    week_end = today_start + timedelta(days=7)

    sites = _count(session, select(sa.func.count(Site.id)))
    units = _count(session, select(sa.func.count(Unit.id)))
    open_tasks = _count(session, select(sa.func.count(Task.id)).where(Task.status != Status.done))

    overdue = _count(
        session,
        select(sa.func.count(Task.id)).where(
            Task.status != Status.done,
            Task.due_at.is_not(None),
            Task.due_at < now,
        ),
    )

    due_today = _count(
        session,
        select(sa.func.count(Task.id)).where(
            Task.status != Status.done,
            Task.due_at >= today_start,
            Task.due_at < today_start + timedelta(days=1),
        ),
    )

    due_week = _count(
        session,
        select(sa.func.count(Task.id)).where(
            Task.status != Status.done,
            Task.due_at >= today_start,
            Task.due_at < week_end,
        ),
    )

    by_status_rows = session.exec(
        select(Task.status, sa.func.count(Task.id)).group_by(Task.status)
    ).all()

    done_value = getattr(Status.done, "value", Status.done)
    by_site_rows = session.exec(
        sa.text(
            """
            SELECT s.name AS site, COUNT(t.id) AS cnt
            FROM task t
            LEFT JOIN site s ON s.id = t.site_id
            WHERE t.status != :done
            GROUP BY s.name
            ORDER BY cnt DESC
            """
        ).bindparams(done=done_value)
    ).mappings().all()

    by_status = [{"status": getattr(s, "value", s), "count": c} for (s, c) in by_status_rows]
    by_site = [{"site": r["site"], "cnt": r["cnt"]} for r in by_site_rows]

    return {
        "kpis": {
            "sites": sites,
            "units": units,
            "open_tasks": open_tasks,
            "overdue": overdue,
            "due_today": due_today,
            "due_this_week": due_week,
        },
        "by_status": by_status,
        "by_site": by_site,
    }

@router.get("/overdue")
def get_overdue(session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    rows = session.exec(
        sa.text(
            """
            SELECT 
                t.id, t.title, t.due_at, t.priority, t.status,
                s.name AS site, 
                u.name AS unit
            FROM task t
            LEFT JOIN site s ON s.id = t.site_id
            LEFT JOIN unit u ON u.id = t.unit_id
            WHERE t.status != :done
              AND t.due_at IS NOT NULL
              AND t.due_at < :now
            ORDER BY t.due_at ASC
            """
        ).bindparams(done=getattr(Status.done, "value", Status.done), now=now)
    ).mappings().all()

    return [dict(r) for r in rows]
