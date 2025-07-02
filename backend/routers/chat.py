from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re

import models
from routers.deps import get_db

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    query: str
    user_id: int

class ChatResponse(BaseModel):
    answer: str

def clean_name(s: str) -> str:
    return s.strip().rstrip('?.!').strip()

@router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    raw = req.query.strip()

    # 1) how much user X owes in group Y  (allow "in Y" or "in group Y")
    m = re.match(
        r"(?i).*user\s+(\d+)\s+owes\s+(?:in\s+group\s+|in\s+)(.+)$",
        raw
    )
    if m:
        uid = int(m.group(1))
        grp_name = clean_name(m.group(2))
        grp = (
            db.query(models.Group)
            .filter(models.Group.name.ilike(grp_name))
            .first()
        )
        if not grp:
            raise HTTPException(404, f'Group "{grp_name}" not found')
        owed = sum(
            s.share
            for e in grp.expenses
            for s in e.splits
            if s.user_id == uid
        )
        return ChatResponse(answer=f"User {uid} owes ₹{owed:.2f} in {grp.name}")

    # 2) who paid the most in group Y or in Y
    m = re.match(
        r"(?i).*who\s+paid\s+the\s+most\s+(?:in\s+group\s+|in\s+)(.+)$",
        raw
    )
    if m:
        grp_name = clean_name(m.group(1))
        grp = (
            db.query(models.Group)
            .filter(models.Group.name.ilike(grp_name))
            .first()
        )
        if not grp:
            raise HTTPException(404, f'Group "{grp_name}" not found')
        paid_sums = {}
        for e in grp.expenses:
            paid_sums[e.paid_by] = paid_sums.get(e.paid_by, 0.0) + e.amount
        if not paid_sums:
            return ChatResponse(answer=f"No expenses in {grp.name}")
        top_user, top_amt = max(paid_sums.items(), key=lambda kv: kv[1])
        return ChatResponse(answer=f"User {top_user} paid the most in {grp.name} (₹{top_amt:.2f})")

    # 3) latest N expenses (optionally in group Y or global)
    m = re.match(
        r"(?i).*latest\s+(\d+)\s+expenses(?:\s+in\s+(?:group\s+)?(.+))?$",
        raw
    )
    if m:
        n = int(m.group(1))
        grp = None
        if m.group(2):
            grp_name = clean_name(m.group(2))
            grp = (
                db.query(models.Group)
                .filter(models.Group.name.ilike(grp_name))
                .first()
            )
            if not grp:
                raise HTTPException(404, f'Group "{grp_name}" not found')
        else:
            # default to first group the user belongs to
            grp = (
                db.query(models.Group)
                .join(models.group_user)
                .filter(models.group_user.c.user_id == req.user_id)
                .first()
            )
            if not grp:
                raise HTTPException(404, "You don’t belong to any groups")
        last_exps = sorted(grp.expenses, key=lambda e: e.id, reverse=True)[:n]
        if not last_exps:
            return ChatResponse(answer=f"No expenses in {grp.name}")
        lines = [
            f"#{e.id} {e.description}: ₹{e.amount:.2f} paid by User {e.paid_by}"
            for e in last_exps
        ]
        return ChatResponse(answer=f"Latest {n} expenses in {grp.name}:\n" + "\n".join(lines))

    # 4) fallback
    return ChatResponse(
        answer="Sorry, I can only answer queries like “How much user X owes in group Y?”, "
               "“Who paid the most in group Y?”, or “Show me my latest N expenses.”"
    )
