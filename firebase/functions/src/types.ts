export type TransactionType = "income" | "expense" | "transfer";

export type TransactionRecord = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  notes?: string;
  occurredAt: Date;
};

export type BudgetRecord = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  monthKey: string;
};

