from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field

class Priority(str, Enum):
    red = "red"
    amber = "amber"
    green = "green"

class Status(str, Enum):
    new = "new"
    in_progress = "in_progress"
    awaiting_parts = "awaiting_parts"
    blocked = "blocked"
    done = "done"
    cancelled = "cancelled"

class MovementReason(str, Enum):
    usage = "usage"
    delivery = "delivery"
    adjustment = "adjustment"
    transfer = "transfer"

class Site(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: Optional[str] = None
    notes: Optional[str] = None

class Unit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    site_id: int = Field(foreign_key="site.id")
    name: str
    floor: Optional[str] = None
    notes: Optional[str] = None

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    site_id: int = Field(foreign_key="site.id")
    unit_id: Optional[int] = Field(default=None, foreign_key="unit.id")
    title: str
    description: str
    priority: Priority = Field(default=Priority.green)
    status: Status = Field(default=Status.new)
    assignee: Optional[str] = None
    due_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    is_recurring: bool = False
    recurrence: Optional[str] = None  # "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
    recur_interval: Optional[int] = 1  # every N units (default 1)
    recur_dow: Optional[int] = None  # 0-6 (if you ever want weekly-on-day)
    recur_dom: Optional[int] = None  # 1-31 (if you ever want monthly-on-day)
    recur_until: Optional[datetime] = None
    last_scheduled_at: Optional[datetime] = None
    
class TaskComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    author: Optional[str] = None
    body: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskAttachment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    filename: str
    url: str     # e.g. /uploads/123_photo.jpg
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sku: str
    name: str
    category: Optional[str] = None
    uom: str = "pcs"
    notes: Optional[str] = None
    min_level_default: int = 0

class InventoryStock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    site_id: int = Field(foreign_key="site.id")
    item_id: int = Field(foreign_key="inventoryitem.id")
    quantity: int = 0
    min_level_override: Optional[int] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockMovement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    stock_id: int = Field(foreign_key="inventorystock.id")
    delta_qty: int
    reason: MovementReason = Field(default=MovementReason.usage)
    reference: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
