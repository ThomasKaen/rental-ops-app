from datetime import datetime
from typing import Optional, Literal
from sqlmodel import SQLModel, Field, Relationship


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
    priority: Literal["red", "amber", "green"] = "green"
    status: Literal["new","in_progress","awaiting_parts","blocked","done","cancelled"] = "new"
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
    reason: Literal["usage", "delivery", "adjustment", "transfer"] = "usage"
    reference: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)