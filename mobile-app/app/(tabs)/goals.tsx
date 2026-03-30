import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { GoalFormModal } from "@/components/goal-form";
import { PillButton, Screen, SectionCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function GoalsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { goals } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-ink">Goals & savings</Text>
        <Text className="mt-2 text-base text-steel">Create savings targets and keep progress visible every day.</Text>

        <View className="mt-6">
          <PillButton label="Add goal" onPress={() => setShowModal(true)} />
        </View>

        <View className="mt-5 gap-3 pb-8">
          {goals.map((goal) => {
            const progress = goal.targetAmount ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
            return (
              <SectionCard key={goal.id}>
                <Text className="text-lg font-semibold text-slate">{goal.name}</Text>
                <Text className="mt-1 text-sm text-steel">
                  {formatCurrency(goal.savedAmount, profile.currency)} of {formatCurrency(goal.targetAmount, profile.currency)}
                </Text>
                <View className="mt-4 h-4 rounded-full bg-sand">
                  <View className="h-4 rounded-full bg-jade" style={{ width: `${progress * 100}%` }} />
                </View>
                <Text className="mt-3 text-xs uppercase tracking-[2px] text-steel">Target date {goal.targetDate.toDateString()}</Text>
              </SectionCard>
            );
          })}
        </View>
      </ScrollView>
      <GoalFormModal visible={showModal} onClose={() => setShowModal(false)} userId={profile.userId} />
    </Screen>
  );
}

