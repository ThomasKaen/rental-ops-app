from __future__ import annotations
from datetime import datetime, timedelta, timezone
from calendar import monthrange
from typing import Optional, Literal

Recurrence = Literal["daily", "weekly", "monthly", "quarterly", "yearly"]

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def add_months(dt: datetime, months: int) -> datetime:
    y = dt.year + (dt.month - 1 + months) // 12
    m = (dt.month - 1 + months) % 12 + 1
    d = min(dt.day, monthrange(y, m)[1])
    return dt.replace(year=y, month=m, day=d)

def next_due(
    due_at: Optional[datetime],
    recurrence: Optional[Recurrence],
    recur_interval: Optional[int] = 1,
    recur_dow: Optional[int] = None,  # 0=Mon..6=Sun, optional
    recur_dom: Optional[int] = None,  # 1..31, optional
) -> Optional[datetime]:
    """Compute the next due datetime from a base rule."""
    if not due_at or not recurrence:
        return None

    interval = max(1, recur_interval or 1)

    if recurrence == "daily":
        return due_at + timedelta(days=interval)

    if recurrence == "weekly":
        base = due_at + timedelta(weeks=interval)
        if recur_dow is None:
            return base
        # shift base to required DOW within the same week window
        # normalize to Monday=0..Sunday=6
        delta = (recur_dow - base.weekday()) % 7
        return base + timedelta(days=delta)

    if recurrence in ("monthly", "quarterly", "yearly"):
        months = {"monthly": 1, "quarterly": 3, "yearly": 12}[recurrence] * interval
        base = add_months(due_at, months)
        if recur_dom is None:
            return base
        # clamp DOM
        dmax = monthrange(base.year, base.month)[1]
        day = min(max(1, recur_dom), dmax)
        return base.replace(day=day)

    return None

def within_until(nd: Optional[datetime], until: Optional[datetime]) -> bool:
    if nd is None:
        return False
    if until is None:
        return True
    return nd <= until
