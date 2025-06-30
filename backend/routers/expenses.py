from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database
from routers.deps import get_db

router = APIRouter(prefix='/groups/{group_id}/expenses', tags=['expenses'])

@router.post('/', response_model=schemas.Expense)
def add_expense(
    group_id: int,
    exp: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, 'Group not found')

    # Ensure the payer still belongs to the group
    member_ids = {u.id for u in grp.users}
    if exp.paid_by not in member_ids:
        raise HTTPException(400, f'Payer user_id {exp.paid_by} not in group')

    # Create the Expense
    db_exp = models.Expense(
        description=exp.description,
        amount=exp.amount,
        paid_by=exp.paid_by,
        split_type=exp.split_type,
        group=grp
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)

    members = grp.users
    if exp.split_type == schemas.SplitType.equal:
        if not members:
            raise HTTPException(400, 'Cannot split with zero members')
        share = exp.amount / len(members)
        for u in members:
            db.add(models.Split(
                expense_id=db_exp.id,
                user_id=u.id,
                share=share
            ))
    else:
        # percentage split: must cover exactly current members
        if not exp.splits or len(exp.splits) != len(members):
            raise HTTPException(400, 'Provide splits for each current member')
        # ensure the splits cover exactly the same member IDs
        split_ids = {s.user_id for s in exp.splits}
        if split_ids != member_ids:
            missing = member_ids - split_ids
            extra = split_ids - member_ids
            detail = []
            if missing: detail.append(f'missing splits for {sorted(missing)}')
            if extra: detail.append(f'unknown splits for {sorted(extra)}')
            raise HTTPException(400, '; '.join(detail))
        for s in exp.splits:
            amt = exp.amount * (s.share / 100)
            db.add(models.Split(
                expense_id=db_exp.id,
                user_id=s.user_id,
                share=amt
            ))
    db.commit()
    return db_exp

@router.get('/', response_model=List[schemas.Expense])
def list_expenses(
    group_id: int,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, "Group not found")
    return grp.expenses
