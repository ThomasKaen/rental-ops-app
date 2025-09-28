# app/routers/inventory.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
from ..db import get_session
from ..models import InventoryItem, InventoryStock, StockMovement, MovementReason

router = APIRouter(prefix="/inventory", tags=["inventory"])

# Items
@router.get("/items", response_model=List[InventoryItem])
def list_items(session: Session = Depends(get_session)):
    return session.exec(select(InventoryItem).order_by(InventoryItem.name)).all()

@router.post("/items", response_model=InventoryItem)
def create_item(item: InventoryItem, session: Session = Depends(get_session)):
    session.add(item); session.commit(); session.refresh(item); return item

@router.put("/items/{item_id}", response_model=InventoryItem)
def update_item(item_id: int, data: InventoryItem, session: Session = Depends(get_session)):
    it = session.get(InventoryItem, item_id)
    if not it: raise HTTPException(404, "Item not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(it,k,v)
    session.add(it); session.commit(); session.refresh(it); return it

@router.delete("/items/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    it = session.get(InventoryItem, item_id)
    if not it: raise HTTPException(404, "Item not found")
    session.delete(it); session.commit(); return {"ok": True}

# Stock
@router.get("/stock", response_model=List[InventoryStock])
def list_stock(site_id: int, session: Session = Depends(get_session)):
    return session.exec(select(InventoryStock).where(InventoryStock.site_id==site_id)).all()

@router.post("/stock/upsert", response_model=InventoryStock)
def upsert_stock(stock: InventoryStock, session: Session = Depends(get_session)):
    row = session.exec(select(InventoryStock).where(
        (InventoryStock.site_id==stock.site_id) & (InventoryStock.item_id==stock.item_id)
    )).first()
    if row:
        if stock.quantity is not None: row.quantity = stock.quantity
        if stock.min_level_override is not None: row.min_level_override = stock.min_level_override
        session.add(row); session.commit(); session.refresh(row); return row
    session.add(stock); session.commit(); session.refresh(stock); return stock

@router.post("/stock/{stock_id}/move", response_model=StockMovement)
def move_stock(stock_id: int, delta: int, reason: MovementReason = MovementReason.usage,
               reference: str | None = None, author: str | None = None,
               session: Session = Depends(get_session)):
    st = session.get(InventoryStock, stock_id)
    if not st: raise HTTPException(404, "Stock not found")
    st.quantity = (st.quantity or 0) + delta
    mv = StockMovement(stock_id=stock_id, delta_qty=delta, reason=reason, reference=reference, author=author)
    session.add(st); session.add(mv); session.commit(); session.refresh(mv); return mv
