from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..models import Unit, Site

# No prefix here – we put /sites and /units directly on the routes
router = APIRouter(prefix="", tags=["units"])


@router.get("/sites/{site_id}/units", response_model=List[Unit])
def list_units_for_site(
    site_id: int,
    session: Session = Depends(get_session),
) -> List[Unit]:
    """List all units for a given site."""
    units = session.exec(select(Unit).where(Unit.site_id == site_id)).all()
    return units


@router.post(
    "/sites/{site_id}/units",
    response_model=Unit,
    status_code=status.HTTP_201_CREATED,
)
def create_unit_for_site(
    site_id: int,
    unit: Unit,
    session: Session = Depends(get_session),
) -> Unit:
    """Create a new unit under a given site."""

    site = session.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    unit.site_id = site_id
    session.add(unit)
    session.commit()
    session.refresh(unit)
    return unit


class UnitUpdate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None


@router.put("/units/{unit_id}", response_model=Unit)
def update_unit(
    unit_id: int,
    payload: UnitUpdate,
    session: Session = Depends(get_session),
) -> Unit:
    """Update unit name/notes (used by Units page)."""

    unit = session.get(Unit, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(unit, key, value)

    session.add(unit)
    session.commit()
    session.refresh(unit)
    return unit


@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(unit_id: int, session: Session = Depends(get_session)) -> None:
    """Delete a unit."""
    unit = session.get(Unit, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    session.delete(unit)
    session.commit()
