import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { TransactionFormModal } from "@/components/transaction-form";
import { PillButton, Screen, SectionCard } from "@/components/ui";
import { exportTransactionsCsv, exportTransactionsPdf } from "@/lib/exports";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Transaction } from "@/types";

export default function TransactionsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { transactions, removeTransaction } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");

  if (!profile) {
    return null;
  }

  const filtered = useMemo(
    () =>
      transactions.filter((item) => {
        const haystack = `${item.categoryName} ${item.notes ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [search, transactions]
  );

  async function handleDelete(id: string) {
    try {
      await removeTransaction(id);
    } catch (error) {
      Alert.alert("Delete failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-ink">Transactions</Text>
        <Text className="mt-2 text-base text-steel">Search, edit, export, and review every movement across your accounts.</Text>

        <SectionCard className="mt-6">
          <TextInput
            className="rounded-2xl bg-sand px-4 py-4"
            placeholder="Filter by notes or category"
            value={search}
            onChangeText={setSearch}
          />
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <PillButton label="New entry" onPress={() => setShowModal(true)} />
            </View>
            <View className="flex-1">
              <PillButton label="Export CSV" onPress={() => exportTransactionsCsv(filtered, profile.currency)} variant="ghost" />
            </View>
          </View>
          <View className="mt-3">
            <PillButton label="Export PDF" onPress={() => exportTransactionsPdf(filtered, profile.currency)} variant="secondary" />
          </View>
        </SectionCard>

        <View className="mt-5 gap-3 pb-8">
          {filtered.map((item) => (
            <SectionCard key={item.id} className="bg-white">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate">{item.categoryName}</Text>
                  <Text className="mt-1 text-sm text-steel">{item.notes || item.accountName}</Text>
                  <Text className="mt-2 text-xs uppercase tracking-[2px] text-steel">{item.occurredAt.toLocaleString()}</Text>
                </View>
                <Text className={`text-lg font-bold ${item.type === "income" ? "text-jade" : "text-coral"}`}>
                  {item.type === "income" ? "+" : "-"}
                  {formatCurrency(item.amount, profile.currency)}
                </Text>
              </View>
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1">
                  <PillButton
                    label="Edit"
                    onPress={() => {
                      setEditing(item);
                      setShowModal(true);
                    }}
                    variant="ghost"
                  />
                </View>
                <View className="flex-1">
                  <PillButton label="Delete" onPress={() => handleDelete(item.id)} variant="secondary" />
                </View>
              </View>
            </SectionCard>
          ))}
        </View>
      </ScrollView>

      <TransactionFormModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        editing={editing}
        userId={profile.userId}
        currency={profile.currency}
      />
    </Screen>
  );
}

