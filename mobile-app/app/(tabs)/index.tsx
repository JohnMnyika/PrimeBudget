import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { BudgetFormModal } from "@/components/budget-form";
import { BudgetPieChart, SpendLineChart } from "@/components/charts";
import { GoalFormModal } from "@/components/goal-form";
import { TransactionFormModal } from "@/components/transaction-form";
import { PillButton, Screen, SectionCard, Stat } from "@/components/ui";
import { requestMpesaTopUp } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function DashboardScreen() {
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const profile = useAuthStore((state) => state.profile);
  const { transactions, budgets, goals, analysis, refreshAnalysis } = useFinanceStore();

  if (!profile) {
    return null;
  }
  const activeProfile = profile;

  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses;
  const totalSaved = goals.reduce((sum, item) => sum + item.savedAmount, 0);

  async function handleInsights() {
    try {
      await refreshAnalysis();
    } catch (error) {
      Alert.alert("Analysis unavailable", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function handleMpesa() {
    try {
      await requestMpesaTopUp({
        phoneNumber: "254700000000",
        amount: 500,
        accountReference: activeProfile.defaultAccountId,
        description: "Prime Budget wallet top-up"
      });
      Alert.alert("M-Pesa prompt sent", "Complete the payment on your phone.");
    } catch (error) {
      Alert.alert("M-Pesa failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-sm uppercase tracking-[3px] text-jade">Fintech planner</Text>
        <Text className="mt-2 text-3xl font-black text-ink">Hello, {activeProfile.displayName.split(" ")[0]}</Text>
        <Text className="mt-2 text-base leading-6 text-steel">Track budgets, spot trends, and move money with one Firebase-powered workspace.</Text>

        <SectionCard className="mt-6 bg-pine">
          <Text className="text-sm uppercase tracking-[3px] text-mint">Total balance</Text>
          <Text className="mt-3 text-4xl font-black text-white">{formatCurrency(balance, activeProfile.currency)}</Text>
          <View className="mt-6 flex-row justify-between">
            <Stat label="Income" value={formatCurrency(income, activeProfile.currency)} accent="text-mint" />
            <Stat label="Expenses" value={formatCurrency(expenses, activeProfile.currency)} accent="text-coral" />
          </View>
        </SectionCard>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <PillButton label="Add transaction" onPress={() => setShowTxModal(true)} />
          </View>
          <View className="flex-1">
            <PillButton label="Run AI insights" onPress={handleInsights} variant="secondary" />
          </View>
        </View>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1">
            <PillButton label="New budget" onPress={() => setShowBudgetModal(true)} variant="ghost" />
          </View>
          <View className="flex-1">
            <PillButton label="M-Pesa top-up" onPress={handleMpesa} variant="ghost" />
          </View>
        </View>

        <SectionCard className="mt-6">
          <Text className="text-xl font-bold text-ink">Weekly expense trend</Text>
          <Text className="mt-1 text-sm text-steel">Fast view of outgoing cash over your latest entries.</Text>
          <View className="mt-5">
            <SpendLineChart transactions={transactions} />
          </View>
        </SectionCard>

        <SectionCard className="mt-5">
          <Text className="text-xl font-bold text-ink">Budget mix</Text>
          <View className="mt-4">
            <BudgetPieChart budgets={budgets} />
          </View>
        </SectionCard>

        <SectionCard className="mt-5">
          <Text className="text-xl font-bold text-ink">Savings progress</Text>
          <Text className="mt-1 text-sm text-steel">{goals.length} active goals, {formatCurrency(totalSaved, activeProfile.currency)} already set aside.</Text>
          <View className="mt-4 gap-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = goal.targetAmount ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
              return (
                <View key={goal.id} className="rounded-2xl bg-sand p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-slate">{goal.name}</Text>
                    <Text className="text-sm text-jade">{Math.round(progress * 100)}%</Text>
                  </View>
                  <View className="mt-3 h-3 rounded-full bg-white">
                    <View className="h-3 rounded-full bg-jade" style={{ width: `${progress * 100}%` }} />
                  </View>
                </View>
              );
            })}
            <PillButton label="Add goal" onPress={() => setShowGoalModal(true)} variant="ghost" />
          </View>
        </SectionCard>

        {analysis ? (
          <SectionCard className="mt-5 mb-8 bg-slate">
            <Text className="text-xl font-bold text-white">AI recommendations</Text>
            <Text className="mt-2 text-sm leading-6 text-sand">
              Top category: {analysis.topSpendingCategory}{"\n"}
              Forecasted expense: {formatCurrency(analysis.forecastedExpense, activeProfile.currency)}{"\n"}
              Recommended savings: {formatCurrency(analysis.recommendedMonthlySavings, activeProfile.currency)}
            </Text>
            <View className="mt-4 gap-2">
              {analysis.alerts.map((alert) => (
                <Text key={alert} className="text-sm text-mint">
                  • {alert}
                </Text>
              ))}
            </View>
          </SectionCard>
        ) : null}
      </ScrollView>

      <TransactionFormModal visible={showTxModal} onClose={() => setShowTxModal(false)} userId={activeProfile.userId} currency={activeProfile.currency} />
      <BudgetFormModal visible={showBudgetModal} onClose={() => setShowBudgetModal(false)} userId={activeProfile.userId} />
      <GoalFormModal visible={showGoalModal} onClose={() => setShowGoalModal(false)} userId={activeProfile.userId} />
    </Screen>
  );
}
