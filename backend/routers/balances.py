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
    if not grp:
        raise HTTPException(404, "Group not found")

    # current members
    member_ids = {u.id for u in grp.users}

    # compute raw balances
    balances: dict[int, float] = {}
    for exp in grp.expenses:
        for split in exp.splits:
            balances[split.user_id] = balances.get(split.user_id, 0) - split.share
        balances[exp.paid_by] = balances.get(exp.paid_by, 0) + exp.amount
    
    # subtract any settled amounts
    for s in grp.settlements:
        # payment from from_user to to_user reduces from_user's debt,
        # so we add back the amount to from_user, and subtract from to_user
        balances[s.from_user] = balances.get(s.from_user, 0) + s.amount
        balances[s.to_user] = balances.get(s.to_user, 0) - s.amount

    # filter out any stale users
    filtered = {uid: bal for uid, bal in balances.items() if uid in member_ids}

    return filtered

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
        # skip groups with no members
        if not grp.users:
            continue

        bal = 0.0
        # expense contributions
        for exp in grp.expenses:
            for split in exp.splits:
                if split.user_id == user_id:
                    bal -= split.share
            if exp.paid_by == user_id:
                bal += exp.amount

        # subtract any settlements in this group
        for s in grp.settlements:
            if s.from_user == user_id:
                # they paid someone: reduce their debt
                bal += s.amount
            if s.to_user == user_id:
                # they were paid: increase their debt
                bal -= s.amount

        balances[grp.id] = bal

    return balances
