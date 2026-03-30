import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultCategories } from "@/constants/categories";
import { runBudgetAnalysis } from "@/lib/analytics";
import {
  addTransaction,
  deleteTransaction,
  fetchCategories,
  recalculateAllBudgetSpending,
  updateTransaction,
  upsertBudget,
  upsertGoal,
  watchBudgets,
  watchGoals,
  watchTransactions
} from "@/lib/firestore";
import { AnalysisSummary, Budget, Category, Goal, Transaction } from "@/types";

type FinanceState = {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  analysis: AnalysisSummary | null;
  hydrated: boolean;
  setHydrated: () => void;
  bootstrap: () => Promise<void>;
  subscribe: (userId: string) => () => void;
  refreshAnalysis: () => Promise<void>;
  saveTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">, existingId?: string) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  saveBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  saveGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: [],
      goals: [],
      categories: defaultCategories,
      analysis: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      bootstrap: async () => {
        try {
          const categories = await fetchCategories();
          set({ categories: categories.length ? (categories as Category[]) : defaultCategories });
        } catch {
          set({ categories: defaultCategories });
        }
      },
      subscribe: (userId) => {
        const unsubs = [
          watchTransactions(userId, (transactions) => set({ transactions })),
          watchBudgets(userId, (budgets) => set({ budgets })),
          watchGoals(userId, (goals) => set({ goals }))
        ];

        recalculateAllBudgetSpending(userId).catch(console.error);
        return () => unsubs.forEach((unsubscribe) => unsubscribe());
      },
      refreshAnalysis: async () => {
        const analysis = await runBudgetAnalysis();
        set({ analysis });
      },
      saveTransaction: async (transaction, existingId) => {
        if (existingId) {
          await updateTransaction(existingId, transaction);
        } else {
          await addTransaction(transaction);
        }
        await recalculateAllBudgetSpending(transaction.userId);
      },
      removeTransaction: async (id) => {
        const tx = get().transactions.find((item) => item.id === id);
        await deleteTransaction(id);
        if (tx) {
          await recalculateAllBudgetSpending(tx.userId);
        }
      },
      saveBudget: async (budget) => {
        await upsertBudget(budget);
      },
      saveGoal: async (goal) => {
        await upsertGoal(goal);
      }
    }),
    {
      name: "prime-budget-mobile-cache",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        categories: state.categories
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated()
    }
  )
);
