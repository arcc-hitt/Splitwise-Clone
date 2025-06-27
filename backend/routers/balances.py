from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database
from routers.deps import get_db

router = APIRouter(tags=['balances'])

@router.get('/groups/{group_id}/balances')
def group_balances(
    group_id: int,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    balances: dict[int, float] = {}
    for exp in grp.expenses:
        for split in exp.splits:
            balances[split.user_id] = balances.get(split.user_id, 0) - split.share
        balances[exp.paid_by] = balances.get(exp.paid_by, 0) + exp.amount
    return balances

@router.get('/users/{user_id}/balances')
def user_balances(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(404, 'User not found')
    balances: dict[int, float] = {}
    groups = db.query(models.Group).all()
    for grp in groups:
        bal = 0.0
        for exp in grp.expenses:
            for split in exp.splits:
                if split.user_id == user_id:
                    bal -= split.share
            if exp.paid_by == user_id:
                bal += exp.amount
        balances[grp.id] = bal
    return balances
