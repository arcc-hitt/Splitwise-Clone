export type SplitType = "equal" | "percentage";

export interface Split {
  user_id: number;
  share: number;
}

export interface ExpenseCreate {
  description: string;
  amount: number;
  paid_by: number;
  split_type: SplitType;
  splits?: Split[];
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
  split_type: SplitType;
  splits: Split[];
}

export interface GroupCreate {
  name: string;
  user_ids: number[];
}

export interface Group {
  id: number;
  name: string;
  user_ids: number[];
  total_expenses: number;
}

export interface Settlement {
  id: number;
  from_user: number;
  to_user: number;
  amount: number;
  paid_at: string;
}

export type BalancesMap = Record<string, number>;