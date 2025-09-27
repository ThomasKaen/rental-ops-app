from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel
from datetime import datetime
from sqlmodel import SQLModel
from .models import Priority, Status


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


class TaskCreate(SQLModel):
    site_id: int
    unit_id: Optional[int] = None
    title: str
    description: str
    priority: Priority = Priority.green
    status: Status = Status.new
    assignee: Optional[str] = None
    due_at: Optional[datetime] = None  # client may send ISO string; we coerce

class TaskUpdate(SQLModel):
    site_id: Optional[int] = None
    unit_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    assignee: Optional[str] = None
    due_at: Optional[datetime] = None  # allow clearing with null

class CommentCreate(SQLModel):
    author: Optional[str] = None
    body: str

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