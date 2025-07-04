from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from routers.deps import get_db

router = APIRouter(prefix='/groups', tags=['groups'])


@router.post('/', response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    # create users if they don't exist
    users = db.query(models.User).filter(models.User.id.in_(group.user_ids)).all()
    existing_ids = {u.id for u in users}
    missing_ids = set(group.user_ids) - existing_ids
    for uid in missing_ids:
        new_user = models.User(id=uid, name=f"User {uid}")
        db.add(new_user)
        users.append(new_user)
    db.commit()

    db_group = models.Group(name=group.name, users=users)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    total = sum(exp.amount for exp in db_group.expenses)
    return schemas.Group(
        id=db_group.id,
        name=db_group.name,
        user_ids=group.user_ids,
        total_expenses=total
    )

@router.get('/{group_id}', response_model=schemas.Group)
def get_group(group_id: int, db: Session = Depends(get_db)):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, 'Group not found')
    total = sum(exp.amount for exp in grp.expenses)
    return schemas.Group(
        id=grp.id,
        name=grp.name,
        user_ids=[u.id for u in grp.users],
        total_expenses=total
    )

@router.delete("/{group_id}", status_code=204)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, "Group not found")
    db.delete(grp)
    db.commit()

@router.get('/', response_model=List[schemas.Group])
def list_groups(db: Session = Depends(get_db)):
    groups = db.query(models.Group).all()
    return [
      schemas.Group(
        id=g.id,
        name=g.name,
        user_ids=[u.id for u in g.users],
        total_expenses=sum(exp.amount for exp in g.expenses)
      )
      for g in groups
    ]

@router.patch("/{group_id}", response_model=schemas.Group)
def update_group(
    group_id: int,
    payload: schemas.GroupUpdate,
    db: Session = Depends(get_db)
):
    grp = db.query(models.Group).get(group_id)
    if not grp:
        raise HTTPException(404, "Group not found")

    if payload.name is not None:
        grp.name = payload.name

    if payload.user_ids is not None:
        users = db.query(models.User).filter(models.User.id.in_(payload.user_ids)).all()
        found_ids = {u.id for u in users}
        missing = [uid for uid in payload.user_ids if uid not in found_ids]
        for uid in missing:
            new_u = models.User(id=uid, name=f"User {uid}")
            db.add(new_u)
            users.append(new_u)
        db.flush()

        # Store old user ids before update
        old_user_ids = set(u.id for u in grp.users)
        grp.users = users
        db.commit()

        # Remove users from User table if they are not in any group
        removed_ids = old_user_ids - set(payload.user_ids)
        for uid in removed_ids:
            user = db.query(models.User).get(uid)
            expense_ref = db.query(models.Expense).filter(models.Expense.paid_by == uid).first()
            if user and not user.groups:
                if expense_ref:
                    continue
                db.delete(user)
        db.commit()

    db.refresh(grp)
    return schemas.Group(
        id=grp.id,
        name=grp.name,
        user_ids=[u.id for u in grp.users],
        total_expenses=sum(e.amount for e in grp.expenses)
    )