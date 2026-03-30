import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Budget } from "@/types";
import { PillButton, SectionCard } from "@/components/ui";
import { getMonthKey } from "@/lib/utils";

export function BudgetFormModal({
  visible,
  onClose,
  userId,
  budget
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
  budget?: Budget | null;
}) {
  const { categories, saveBudget } = useFinanceStore();
  const expenseCategories = categories.filter((item) => item.type === "expense");
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? expenseCategories[0]?.id ?? "food");
  const [limitAmount, setLimitAmount] = useState(String(budget?.limitAmount ?? ""));

  async function handleSave() {
    const category = expenseCategories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    await saveBudget({
      id: budget?.id,
      userId,
      monthKey: budget?.monthKey ?? getMonthKey(),
      categoryId,
      categoryName: category.name,
      limitAmount: Number(limitAmount),
      spentAmount: budget?.spentAmount ?? 0,
      alertThreshold: budget?.alertThreshold ?? 0.8
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <SectionCard className="rounded-b-none bg-sand">
          <ScrollView>
            <Text className="text-2xl font-bold text-ink">Monthly budget</Text>
            <Text className="mt-1 text-sm text-steel">Set category caps with alert thresholds and live tracking.</Text>
            <View className="mt-5 gap-4">
              <Text className="text-sm font-medium text-slate">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {expenseCategories.map((item) => (
                  <PillButton
                    key={item.id}
                    label={item.name}
                    onPress={() => setCategoryId(item.id)}
                    variant={item.id === categoryId ? "primary" : "ghost"}
                  />
                ))}
              </View>
              <Text className="text-sm font-medium text-slate">Limit amount</Text>
              <TextInput
                className="rounded-2xl bg-white px-4 py-4 text-lg"
                value={limitAmount}
                keyboardType="decimal-pad"
                onChangeText={setLimitAmount}
                placeholder="15000"
              />
            </View>
            <View className="mt-5 flex-row gap-3 pb-6">
              <PillButton label="Save budget" onPress={handleSave} />
              <PillButton label="Cancel" onPress={onClose} variant="ghost" />
            </View>
          </ScrollView>
        </SectionCard>
      </View>
    </Modal>
  );
}

