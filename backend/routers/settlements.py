from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from routers.deps import get_db

router = APIRouter(prefix="/groups/{group_id}/settlements", tags=["settlements"])

@router.post("/", response_model=schemas.SettlementOut, status_code=201)
def create_settlement(
    group_id: int,
    payload: schemas.SettlementCreate,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, "Group not found")

    members = {u.id for u in grp.users}
    if payload.from_user not in members or payload.to_user not in members:
        raise HTTPException(400, "Both from_user and to_user must be current group members")

    # compute current net balances to ensure amount <= what from_user owes to to_user
    # For simplicity, skip deep validation here, or implement a check against computed debts.

    settlement = models.Settlement(
        group_id=group_id,
        from_user=payload.from_user,
        to_user=payload.to_user,
        amount=payload.amount
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement

@router.get("/", response_model=List[schemas.SettlementOut])
def list_settlements(group_id: int, db: Session = Depends(get_db)):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, "Group not found")
    return grp.settlements
