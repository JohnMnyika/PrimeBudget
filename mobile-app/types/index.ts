export type ThemeMode = "light" | "dark" | "system";
export type CurrencyCode = "KES" | "USD" | "EUR" | "GBP";
export type TransactionType = "income" | "expense" | "transfer";

export type UserProfile = {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: CurrencyCode;
  theme: ThemeMode;
  timezone: string;
  biometricEnabled: boolean;
  defaultAccountId: string;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "cash" | "bank" | "mobile_money" | "savings";
  balance: number;
  color: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  keywords: string[];
  isSystem: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  predictedCategoryId?: string;
  source: "manual" | "voice" | "mpesa" | "system";
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Budget = {
  id: string;
  userId: string;
  monthKey: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: Date;
  status: "active" | "complete" | "paused";
  createdAt: Date;
  updatedAt: Date;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "budget_alert" | "weekly_summary" | "payment_reminder" | "system";
  read: boolean;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};

export type AnalysisSummary = {
  topSpendingCategory: string;
  unusualSpendingDetected: boolean;
  forecastedExpense: number;
  recommendedMonthlySavings: number;
  alerts: string[];
};
