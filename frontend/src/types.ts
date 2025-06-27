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

export interface Expense {
    id: number;
    description: string;
    amount: number;
    paid_by: number;
    split_type: "equal" | "percentage";
    splits: Split[];
  }
