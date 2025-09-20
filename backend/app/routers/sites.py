from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..db import get_session
from ..models import Site
from ..schemas import SiteCreate


router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("")
def list_sites(session: Session = Depends(get_session)):
    return session.exec(select(Site)).all()


@router.post("")
def create_site(payload: SiteCreate, session: Session = Depends(get_session)):
    site = Site(**payload.model_dump())
    session.add(site)
    session.commit()
    session.refresh(site)
    return site