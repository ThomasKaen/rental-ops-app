from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..db import get_session
from ..models import Unit
from ..schemas import UnitCreate


router = APIRouter(prefix="/units", tags=["units"])


@router.get("")
def list_units(site_id: int | None = None, session: Session = Depends(get_session)):
    q = select(Unit)
    if site_id:
        q = q.where(Unit.site_id == site_id)
    return session.exec(q).all()


@router.post("")
def create_unit(payload: UnitCreate, session: Session = Depends(get_session)):
    unit = Unit(**payload.model_dump())
    session.add(unit)
    session.commit()
    session.refresh(unit)
    return unit