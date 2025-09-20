from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from ..db import get_session
from ..models import InventoryItem, InventoryStock, StockMovement
from ..schemas import ItemCreate, StockCreate, MovementCreate


router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/items")
def list_items(session: Session = Depends(get_session)):
    return session.exec(select(InventoryItem)).all()


@router.post("/items")
def create_item(payload: ItemCreate, session: Session = Depends(get_session)):
    item = InventoryItem(**payload.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.get("/stock")
def list_stock(site_id: int, session: Session = Depends(get_session)):
    return session.exec(select(InventoryStock).where(InventoryStock.site_id == site_id)).all()


@router.post("/stock")
def create_stock(payload: StockCreate, session: Session = Depends(get_session)):
    stock = InventoryStock(**payload.model_dump())
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock


@router.post("/movements")
def create_movement(payload: MovementCreate, session: Session = Depends(get_session)):
    stock = session.get(InventoryStock, payload.stock_id)
    if not stock:
        raise HTTPException(404, "Stock not found")
    stock.quantity += payload.delta_qty
    stock.updated_at = datetime.now()
    mv = StockMovement(**payload.model_dump())
    session.add(stock)
    session.add(mv)
    session.commit()
    session.refresh(mv)
    return mv