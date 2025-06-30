from datetime import datetime
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

class SplitType(str, Enum):
    equal = 'equal'
    percentage = 'percentage'

class SplitCreate(BaseModel):
    user_id: int
    share: float

class SplitOut(BaseModel):
    user_id: int
    share: float

    class Config:
        orm_mode = True

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitType
    splits: Optional[List[SplitCreate]] = None

class Expense(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    split_type: SplitType
    splits: List[SplitOut]

    class Config:
        orm_mode = True

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class Group(BaseModel):
    id: int
    name: str
    user_ids: List[int]
    total_expenses: float

    class Config:
        orm_mode = True

class GroupUpdate(BaseModel):
    name: str | None = None
    user_ids: List[int] | None = None

class SettlementCreate(BaseModel):
    from_user: int
    to_user: int
    amount: float

class SettlementOut(BaseModel):
    id: int
    from_user: int
    to_user: int
    amount: float
    paid_at: datetime

    class Config:
        orm_mode = True