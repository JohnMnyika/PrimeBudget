import { BudgetRecord, TransactionRecord } from "./types.js";

export function categorizeFromKeywords(
  note: string,
  categories: Array<{ id: string; name: string; keywords?: string[] }>
) {
  const normalized = note.toLowerCase();
  const found = categories.find((category) => category.keywords?.some((keyword) => normalized.includes(keyword.toLowerCase())));
  return found?.id ?? null;
}

export function buildBudgetAnalysis(transactions: TransactionRecord[], budgets: BudgetRecord[]) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;

  const byCategory = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryName] = (acc[item.categoryName] || 0) + item.amount;
    return acc;
  }, {});

  const [topSpendingCategory = "None"] =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] ?? [];

  const unusualSpendingDetected = expenses.some((item) => item.amount > averageExpense * 1.8 && averageExpense > 0);
  const forecastedExpense = Math.round(averageExpense * 30);
  const monthlyIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const recommendedMonthlySavings = Math.max(Math.round(monthlyIncome * 0.2), 0);

  const alerts = budgets.flatMap((budget) => {
    if (!budget.limitAmount) {
      return [];
    }
    const ratio = budget.spentAmount / budget.limitAmount;
    if (ratio >= 1) {
      return [`${budget.categoryName} budget exceeded.`];
    }
    if (ratio >= 0.8) {
      return [`${budget.categoryName} budget is nearing the limit.`];
    }
    return [];
  });

  return {
    topSpendingCategory,
    unusualSpendingDetected,
    forecastedExpense,
    recommendedMonthlySavings,
    alerts
  };
}

