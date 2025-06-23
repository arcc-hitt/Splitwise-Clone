from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

class SplitType(str, Enum):
    equal = 'equal'
    percentage = 'percentage'

class SplitCreate(BaseModel):
    user_id: int
    share: float

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitType
    splits: Optional[List[SplitCreate]]

class Expense(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    split_type: SplitType

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
