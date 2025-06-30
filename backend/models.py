from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Table, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base
import enum

# association table for group users
group_user = Table(
    'group_user', Base.metadata,
    Column('group_id', ForeignKey('groups.id'), primary_key=True),
    Column('user_id', ForeignKey('users.id'), primary_key=True)  
)

class SplitType(enum.Enum):
    equal = "equal"
    percentage = "percentage"

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    users = relationship('User', secondary=group_user, back_populates='groups')
    expenses = relationship('Expense', back_populates='group')
    settlements = relationship("Settlement", back_populates="group", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    groups = relationship('Group', secondary=group_user, back_populates='users')

class Expense(Base):
    __tablename__ = 'expenses'
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    paid_by = Column(Integer, ForeignKey('users.id'))
    split_type = Column(Enum(SplitType), nullable=False)

    group_id = Column(Integer, ForeignKey('groups.id'))
    group = relationship('Group', back_populates='expenses')
    splits = relationship('Split', back_populates='expense')

class Split(Base):
    __tablename__ = 'splits'
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey('expenses.id'))
    user_id = Column(Integer)
    share = Column(Float)  # amount or percentage

    expense = relationship('Expense', back_populates='splits')

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    from_user = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    group = relationship("Group", back_populates="settlements")