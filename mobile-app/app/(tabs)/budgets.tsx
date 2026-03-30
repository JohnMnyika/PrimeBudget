import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BudgetFormModal } from "@/components/budget-form";
import { PillButton, Screen, SectionCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function BudgetsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { budgets } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-ink">Budgets</Text>
        <Text className="mt-2 text-base text-steel">Live category limits with threshold alerts and real-time Firestore updates.</Text>

        <View className="mt-6">
          <PillButton label="Create budget" onPress={() => setShowModal(true)} />
        </View>

        <View className="mt-5 gap-3 pb-8">
          {budgets.map((budget) => {
            const ratio = budget.limitAmount ? Math.min(budget.spentAmount / budget.limitAmount, 1) : 0;
            return (
              <SectionCard key={budget.id}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-slate">{budget.categoryName}</Text>
                  <Text className={`${ratio >= 1 ? "text-coral" : ratio >= budget.alertThreshold ? "text-amber-600" : "text-jade"} font-bold`}>
                    {Math.round(ratio * 100)}%
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-steel">
                  {formatCurrency(budget.spentAmount, profile.currency)} of {formatCurrency(budget.limitAmount, profile.currency)}
                </Text>
                <View className="mt-4 h-4 rounded-full bg-sand">
                  <View className={`h-4 rounded-full ${ratio >= 1 ? "bg-coral" : "bg-jade"}`} style={{ width: `${ratio * 100}%` }} />
                </View>
              </SectionCard>
            );
          })}
        </View>
      </ScrollView>
      <BudgetFormModal visible={showModal} onClose={() => setShowModal(false)} userId={profile.userId} />
    </Screen>
  );
}

