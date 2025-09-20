from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


class SiteCreate(BaseModel):
    name: str
    address: Optional[str] = None
    notes: Optional[str] = None


class SiteRead(BaseModel):
    id: int
    name: str
    address: Optional[str]
    notes: Optional[str]

class UnitCreate(BaseModel):
    site_id: int
    name: str
    floor: Optional[str] = None
    notes: Optional[str] = None


class TaskCreate(BaseModel):
    site_id: int
    unit_id: Optional[int] = None
    title: str
    description: str
    priority: Literal["red","amber","green"] = "green"
    assignee: Optional[str] = None
    due_at: Optional[datetime] = None


class TaskPatch(BaseModel):
    status: Optional[Literal["new","in_progress","awaiting_parts","blocked","done","cancelled"]] = None
    assignee: Optional[str] = None
    priority: Optional[Literal["red","amber","green"]] = None
    due_at: Optional[datetime] = None

class ItemCreate(BaseModel):
    sku: str
    name: str
    category: Optional[str] = None
    uom: str = "pcs"
    min_level_default: int = 0


class StockCreate(BaseModel):
    site_id: int
    item_id: int
    min_level_override: Optional[int] = None


class MovementCreate(BaseModel):
    stock_id: int
    delta_qty: int
    reason: Literal["usage","delivery","adjustment","transfer"] = "usage"
    reference: Optional[str] = None
    author: Optional[str] = None