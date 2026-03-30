import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { Budget, Goal, Transaction, UserProfile } from "@/types";
import { firestore } from "@/lib/firebase";
import { getMonthKey } from "@/lib/utils";

const now = () => serverTimestamp();

export async function upsertUserProfile(profile: Omit<UserProfile, "createdAt" | "updatedAt">) {
  const ref = doc(firestore, "users", profile.userId);
  await setDoc(
    ref,
    {
      ...profile,
      createdAt: now(),
      updatedAt: now()
    },
    { merge: true }
  );
}

export function watchUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(firestore, "users", userId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    callback({
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date()
    } as UserProfile);
  });
}

export function watchTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
  const q = query(
    collection(firestore, "transactions"),
    where("userId", "==", userId),
    orderBy("occurredAt", "desc"),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          ...data,
          occurredAt: data.occurredAt?.toDate?.() ?? new Date(),
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date()
        } as Transaction;
      })
    );
  });
}

export function watchBudgets(userId: string, callback: (budgets: Budget[]) => void) {
  const q = query(
    collection(firestore, "budgets"),
    where("userId", "==", userId),
    where("monthKey", "==", getMonthKey()),
    orderBy("categoryName", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date()
        } as Budget;
      })
    );
  });
}

export function watchGoals(userId: string, callback: (goals: Goal[]) => void) {
  const q = query(collection(firestore, "goals"), where("userId", "==", userId), orderBy("targetDate", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          ...data,
          targetDate: data.targetDate?.toDate?.() ?? new Date(),
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date()
        } as Goal;
      })
    );
  });
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) {
  await addDoc(collection(firestore, "transactions"), {
    ...transaction,
    occurredAt: Timestamp.fromDate(transaction.occurredAt),
    createdAt: now(),
    updatedAt: now()
  });
}

export async function updateTransaction(id: string, payload: Partial<Transaction>) {
  const ref = doc(firestore, "transactions", id);
  await updateDoc(ref, {
    ...payload,
    occurredAt: payload.occurredAt ? Timestamp.fromDate(payload.occurredAt) : undefined,
    updatedAt: now()
  });
}

export async function deleteTransaction(id: string) {
  await deleteDoc(doc(firestore, "transactions", id));
}

export async function upsertBudget(budget: Omit<Budget, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const ref = budget.id ? doc(firestore, "budgets", budget.id) : doc(collection(firestore, "budgets"));
  await setDoc(
    ref,
    {
      ...budget,
      createdAt: now(),
      updatedAt: now()
    },
    { merge: true }
  );
}

export async function upsertGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const ref = goal.id ? doc(firestore, "goals", goal.id) : doc(collection(firestore, "goals"));
  await setDoc(
    ref,
    {
      ...goal,
      targetDate: Timestamp.fromDate(goal.targetDate),
      createdAt: now(),
      updatedAt: now()
    },
    { merge: true }
  );
}

export async function fetchCategories() {
  const snapshot = await getDocs(query(collection(firestore, "categories"), orderBy("name", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function recomputeBudgetSpend(userId: string, categoryId: string, monthKey = getMonthKey()) {
  const budgetQuery = query(
    collection(firestore, "budgets"),
    where("userId", "==", userId),
    where("categoryId", "==", categoryId),
    where("monthKey", "==", monthKey),
    limit(1)
  );
  const budgetDocs = await getDocs(budgetQuery);
  if (budgetDocs.empty) {
    return;
  }

  const budgetDoc = budgetDocs.docs[0];
  const start = new Date(`${monthKey}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const txSnap = await getDocs(
    query(
      collection(firestore, "transactions"),
      where("userId", "==", userId),
      where("categoryId", "==", categoryId),
      where("type", "==", "expense"),
      where("occurredAt", ">=", Timestamp.fromDate(start)),
      where("occurredAt", "<", Timestamp.fromDate(end))
    )
  );

  const spentAmount = txSnap.docs.reduce((sum, item) => sum + Number(item.data().amount || 0), 0);
  await updateDoc(doc(firestore, "budgets", budgetDoc.id), { spentAmount, updatedAt: now() });
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(firestore, "notifications", notificationId), {
    read: true,
    updatedAt: now()
  });
}

export async function createDefaultCategoriesIfMissing(categories: Array<Record<string, unknown>>) {
  await Promise.all(
    categories.map(async (category) => {
      const ref = doc(firestore, "categories", String(category.id));
      await setDoc(
        ref,
        {
          ...category,
          createdAt: now(),
          updatedAt: now()
        },
        { merge: true }
      );
    })
  );
}

export async function recalculateAllBudgetSpending(userId: string) {
  const budgets = await getDocs(query(collection(firestore, "budgets"), where("userId", "==", userId)));
  await Promise.all(
    budgets.docs.map(async (budget) => {
      const data = budget.data();
      await recomputeBudgetSpend(userId, data.categoryId, data.monthKey);
    })
  );
}

