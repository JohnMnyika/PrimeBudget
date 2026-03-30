import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { Goal } from "@/types";
import { PillButton, SectionCard } from "@/components/ui";
import { useFinanceStore } from "@/store/useFinanceStore";

export function GoalFormModal({
  visible,
  onClose,
  userId,
  goal
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
  goal?: Goal | null;
}) {
  const { saveGoal } = useFinanceStore();
  const [name, setName] = useState(goal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(String(goal?.targetAmount ?? ""));
  const [savedAmount, setSavedAmount] = useState(String(goal?.savedAmount ?? ""));
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );

  async function handleSave() {
    await saveGoal({
      id: goal?.id,
      userId,
      name,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount),
      targetDate: new Date(targetDate),
      status: goal?.status ?? "active"
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <SectionCard className="rounded-b-none bg-sand">
          <ScrollView>
            <Text className="text-2xl font-bold text-ink">Savings goal</Text>
            <View className="mt-5 gap-4">
              <TextInput className="rounded-2xl bg-white px-4 py-4" value={name} onChangeText={setName} placeholder="Emergency fund" />
              <TextInput
                className="rounded-2xl bg-white px-4 py-4"
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="300000"
                keyboardType="decimal-pad"
              />
              <TextInput
                className="rounded-2xl bg-white px-4 py-4"
                value={savedAmount}
                onChangeText={setSavedAmount}
                placeholder="120000"
                keyboardType="decimal-pad"
              />
              <TextInput className="rounded-2xl bg-white px-4 py-4" value={targetDate} onChangeText={setTargetDate} placeholder="2026-12-31" />
            </View>
            <View className="mt-5 flex-row gap-3 pb-6">
              <PillButton label="Save goal" onPress={handleSave} />
              <PillButton label="Cancel" onPress={onClose} variant="ghost" />
            </View>
          </ScrollView>
        </SectionCard>
      </View>
    </Modal>
  );
}
