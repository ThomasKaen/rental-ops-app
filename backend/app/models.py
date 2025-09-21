# backend/app/models.py
from datetime import datetime
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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StockMovement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    stock_id: int = Field(foreign_key="inventorystock.id")
    delta_qty: int
    reason: MovementReason = Field(default=MovementReason.usage)
    reference: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
