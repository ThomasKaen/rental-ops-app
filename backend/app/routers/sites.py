from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from ..db import get_session
from ..models import Site, Unit

router = APIRouter(prefix="/sites", tags=["sites"])

@router.get("/", response_model=List[Site])
def list_sites(session: Session = Depends(get_session)):
    return session.exec(select(Site).order_by(Site.name)).all()

@router.post("/", response_model=Site)
def create_site(site: Site, session: Session = Depends(get_session)):
    session.add(site); session.commit(); session.refresh(site); return site

@router.put("/{site_id}", response_model=Site)
def update_site(site_id: int, data: Site, session: Session = Depends(get_session)):
    s = session.get(Site, site_id)
    if not s: raise HTTPException(404, "Site not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    session.add(s); session.commit(); session.refresh(s); return s

@router.delete("/{site_id}")
def delete_site(site_id: int, session: Session = Depends(get_session)):
    s = session.get(Site, site_id)
    if not s: raise HTTPException(404, "Site not found")
    session.delete(s); session.commit(); return {"ok": True}

# Units
@router.get("/{site_id}/units", response_model=List[Unit])
def list_units(site_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Unit).where(Unit.site_id == site_id).order_by(Unit.name)).all()

@router.post("/{site_id}/units", response_model=Unit)
def create_unit(site_id: int, unit: Unit, session: Session = Depends(get_session)):
    u = Unit(site_id=site_id, name=unit.name, floor=unit.floor, notes=unit.notes)
    session.add(u); session.commit(); session.refresh(u); return u
