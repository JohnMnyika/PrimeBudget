import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Transaction } from "@/types";
import { PillButton, SectionCard } from "@/components/ui";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string;
  currency: string;
  editing?: Transaction | null;
};

export function TransactionFormModal({ visible, onClose, userId, currency, editing }: Props) {
  const { categories, saveTransaction } = useFinanceStore();
  const { transcript, isListening, setTranscript, startListening, stopListening } = useVoiceInput();

  const expenseCategories = useMemo(() => categories.filter((item) => item.type === "expense"), [categories]);
  const incomeCategories = useMemo(() => categories.filter((item) => item.type === "income"), [categories]);

  const [type, setType] = useState<"income" | "expense">(editing?.type === "income" ? "income" : "expense");
  const [amount, setAmount] = useState(String(editing?.amount ?? ""));
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(editing?.categoryId ?? expenseCategories[0]?.id ?? "food");

  const currentCategories = type === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = currentCategories.find((item) => item.id === selectedCategoryId) ?? currentCategories[0];

  async function handleSave() {
    if (!selectedCategory || !amount) {
      return;
    }

    await saveTransaction(
      {
        userId,
        type,
        amount: Number(amount),
        currency: currency as Transaction["currency"],
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        accountId: "m-pesa-main",
        accountName: "M-Pesa",
        notes: transcript || notes,
        source: transcript ? "voice" : "manual",
        occurredAt: editing?.occurredAt ?? new Date()
      },
      editing?.id
    );

    setAmount("");
    setNotes("");
    setTranscript("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <SectionCard className="rounded-b-none bg-sand">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-2xl font-bold text-ink">{editing ? "Edit transaction" : "New transaction"}</Text>
            <Text className="mt-1 text-sm text-steel">Track expenses, income, and voice-captured entries.</Text>

            <View className="mt-5 flex-row gap-3">
              <PillButton label="Expense" onPress={() => setType("expense")} variant={type === "expense" ? "primary" : "ghost"} />
              <PillButton label="Income" onPress={() => setType("income")} variant={type === "income" ? "primary" : "ghost"} />
            </View>

            <View className="mt-5 gap-4">
              <View>
                <Text className="mb-2 text-sm font-medium text-slate">Amount</Text>
                <TextInput
                  className="rounded-2xl bg-white px-4 py-4 text-lg"
                  keyboardType="decimal-pad"
                  placeholder={formatCurrency(0, currency)}
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-slate">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {currentCategories.map((category) => (
                      <Pressable
                        key={category.id}
                        className={`rounded-full px-4 py-3 ${selectedCategoryId === category.id ? "bg-pine" : "bg-white"}`}
                        onPress={() => setSelectedCategoryId(category.id)}
                      >
                        <Text className={selectedCategoryId === category.id ? "text-white" : "text-slate"}>{category.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-slate">Notes</Text>
                <TextInput
                  className="rounded-2xl bg-white px-4 py-4 text-base"
                  placeholder="What was this for?"
                  multiline
                  value={transcript || notes}
                  onChangeText={(value) => {
                    setTranscript("");
                    setNotes(value);
                  }}
                />
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <PillButton label={isListening ? "Stop voice" : "Voice input"} onPress={isListening ? stopListening : startListening} variant="secondary" />
              <PillButton label="Save" onPress={handleSave} />
            </View>

            <View className="mt-3 pb-6">
              <PillButton label="Cancel" onPress={onClose} variant="ghost" />
            </View>
          </ScrollView>
        </SectionCard>
      </View>
    </Modal>
  );
}

