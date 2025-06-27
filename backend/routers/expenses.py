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
        share = exp.amount / len(members)
        for u in members:
            split = models.Split(
                expense_id=db_exp.id,
                user_id=u.id,
                share=share
            )
            db.add(split)
    else:
        # percentage split
        if not exp.splits or len(exp.splits) != len(members):
            raise HTTPException(400, 'Provide splits for each member')
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
