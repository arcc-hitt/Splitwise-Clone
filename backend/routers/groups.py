from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database

router = APIRouter(prefix='/groups', tags=['groups'])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
