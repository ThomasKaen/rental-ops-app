from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db import get_session
from ..models import Site

router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("", response_model=List[Site])
def list_sites(session: Session = Depends(get_session)) -> List[Site]:
    """List all sites."""
    sites = session.exec(select(Site)).all()
    return sites


@router.post("", response_model=Site, status_code=status.HTTP_201_CREATED)
def create_site(site: Site, session: Session = Depends(get_session)) -> Site:
    """Create a new site."""
    session.add(site)
    session.commit()
    session.refresh(site)
    return site


@router.get("/{site_id}", response_model=Site)
def get_site(site_id: int, session: Session = Depends(get_session)) -> Site:
    """Get a single site by id."""
    site = session.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: int, session: Session = Depends(get_session)) -> None:
    """Delete a site."""
    site = session.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    session.delete(site)
    session.commit()
