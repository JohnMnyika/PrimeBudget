const test = require("node:test");
const assert = require("node:assert/strict");

function buildBudgetAnalysis(transactions, budgets) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;
  const byCategory = expenses.reduce((acc, item) => {
    acc[item.categoryName] = (acc[item.categoryName] || 0) + item.amount;
    return acc;
  }, {});
  const [topSpendingCategory = "None"] = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || [];
  const unusualSpendingDetected = expenses.some((item) => item.amount > averageExpense * 1.8 && averageExpense > 0);
  const forecastedExpense = Math.round(averageExpense * 30);
  const alerts = budgets.flatMap((budget) => {
    const ratio = budget.limitAmount ? budget.spentAmount / budget.limitAmount : 0;
    if (ratio >= 1) return [`${budget.categoryName} budget exceeded.`];
    if (ratio >= 0.8) return [`${budget.categoryName} budget is nearing the limit.`];
    return [];
  });
  return {
    topSpendingCategory,
    unusualSpendingDetected,
    forecastedExpense,
    recommendedMonthlySavings: 6000,
    alerts
  };
}

test("buildBudgetAnalysis returns spending insights", () => {
  const result = buildBudgetAnalysis(
    [
      { type: "expense", amount: 1000, categoryName: "Food" },
      { type: "expense", amount: 10000, categoryName: "Transport" },
      { type: "income", amount: 30000, categoryName: "Salary" }
    ],
    [{ categoryName: "Transport", limitAmount: 5000, spentAmount: 10000 }]
  );

  assert.equal(result.topSpendingCategory, "Transport");
  assert.equal(result.unusualSpendingDetected, true);
  assert.equal(result.forecastedExpense, 165000);
  assert.equal(result.alerts[0], "Transport budget exceeded.");
});
