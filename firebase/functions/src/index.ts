import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Filter, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { buildBudgetAnalysis, categorizeFromKeywords } from "./analysis.js";
import { initiateStkPush, mpesaSecrets } from "./mpesa.js";
import { BudgetRecord, TransactionRecord } from "./types.js";

initializeApp();

const db = getFirestore();
const messaging = getMessaging();
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

function requireUser(auth?: { uid?: string }) {
  if (!auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  return auth.uid;
}

async function logAdminEvent(event: string, status: string, userId?: string, details?: Record<string, unknown>) {
  await db.collection("adminLogs").add({
    event,
    status,
    userId: userId ?? null,
    details: details ?? {},
    createdAt: FieldValue.serverTimestamp()
  });
}

async function loadUserTransactions(userId: string): Promise<TransactionRecord[]> {
  const snapshot = await db
    .collection("transactions")
    .where("userId", "==", userId)
    .orderBy("occurredAt", "desc")
    .limit(200)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      amount: Number(data.amount || 0),
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      notes: data.notes,
      occurredAt: data.occurredAt?.toDate?.() ?? new Date()
    } as TransactionRecord;
  });
}

async function loadUserBudgets(userId: string): Promise<BudgetRecord[]> {
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const snapshot = await db
    .collection("budgets")
    .where("userId", "==", userId)
    .where("monthKey", "==", monthKey)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      limitAmount: Number(data.limitAmount || 0),
      spentAmount: Number(data.spentAmount || 0),
      monthKey: data.monthKey
    } as BudgetRecord;
  });
}

export const analyzeBudgetPatterns = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  const userId = requireUser(request.auth);
  const [transactions, budgets] = await Promise.all([loadUserTransactions(userId), loadUserBudgets(userId)]);
  const analysis = buildBudgetAnalysis(transactions, budgets);

  if (OPENAI_API_KEY.value()) {
    logger.info("OPENAI_API_KEY is configured; optional AI enrichment can be enabled.", { userId });
  }

  await logAdminEvent("budget_analysis", "success", userId, analysis);
  return analysis;
});

export const initiateMpesaPayment = onCall({ secrets: mpesaSecrets }, async (request) => {
  const userId = requireUser(request.auth);
  const payload = request.data as {
    phoneNumber?: string;
    amount?: number;
    accountReference?: string;
    description?: string;
  };

  if (!payload.phoneNumber || !payload.amount || !payload.accountReference) {
    throw new HttpsError("invalid-argument", "phoneNumber, amount, and accountReference are required.");
  }

  const result = await initiateStkPush({
    phoneNumber: payload.phoneNumber,
    amount: Number(payload.amount),
    accountReference: payload.accountReference,
    description: payload.description ?? "Prime Budget payment"
  });

  await logAdminEvent("mpesa_stk_push", "success", userId, result as Record<string, unknown>);
  return result;
});

export const mpesaCallback = onRequest(async (request, response) => {
  const callbackData = request.body?.Body?.stkCallback;
  await logAdminEvent("mpesa_callback", "received", undefined, callbackData ?? {});

  if (callbackData?.ResultCode === 0) {
    const amountMeta = callbackData.CallbackMetadata?.Item?.find((item: { Name: string }) => item.Name === "Amount");
    const receiptMeta = callbackData.CallbackMetadata?.Item?.find((item: { Name: string }) => item.Name === "MpesaReceiptNumber");
    await db.collection("adminLogs").add({
      event: "mpesa_payment_success",
      status: "success",
      details: {
        checkoutRequestId: callbackData.CheckoutRequestID,
        amount: amountMeta?.Value ?? 0,
        receipt: receiptMeta?.Value ?? ""
      },
      createdAt: FieldValue.serverTimestamp()
    });
  }

  response.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export const generateWeeklySummaries = onSchedule("every monday 07:00", async () => {
  const users = await db.collection("users").get();

  for (const userDoc of users.docs) {
    const user = userDoc.data();
    const transactions = await loadUserTransactions(user.userId);
    const expenses = transactions.filter((item) => item.type === "expense").slice(0, 10);
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);

    await db.collection("notifications").add({
      userId: user.userId,
      title: "Weekly spending summary",
      body: `You spent ${total.toFixed(0)} this week across ${expenses.length} recent expense entries.`,
      type: "weekly_summary",
      read: false,
      metadata: {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    if (Array.isArray(user.fcmTokens) && user.fcmTokens.length) {
      await messaging.sendEachForMulticast({
        tokens: user.fcmTokens,
        notification: {
          title: "Prime Budget weekly summary",
          body: `You spent ${total.toFixed(0)} this week.`
        }
      });
    }
  }
});

export const processRecurringTransactions = onSchedule("every day 05:00", async () => {
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const recurring = await db.collection("transactions").where("isRecurring", "==", true).get();

  for (const doc of recurring.docs) {
    const data = doc.data();
    const rule = String(data.recurrenceRule ?? "monthly");
    const occurredAt = data.occurredAt?.toDate?.() ?? new Date();
    const alreadyCreated = await db
      .collection("transactions")
      .where("userId", "==", data.userId)
      .where("source", "==", "system")
      .where("notes", "==", `Recurring copy of ${doc.id}`)
      .where("occurredAt", ">=", Timestamp.fromDate(new Date(`${monthKey}-01T00:00:00.000Z`)))
      .limit(1)
      .get();

    const shouldCreate =
      (rule === "monthly" && occurredAt.getDate() === today.getDate()) ||
      (rule === "weekly" && occurredAt.getDay() === today.getDay());

    if (shouldCreate && alreadyCreated.empty) {
      await db.collection("transactions").add({
        ...data,
        source: "system",
        notes: `Recurring copy of ${doc.id}`,
        occurredAt: Timestamp.fromDate(today),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  }
});

export const detectBudgetAlerts = onSchedule("every day 08:00", async () => {
  const budgets = await db.collection("budgets").get();
  for (const doc of budgets.docs) {
    const budget = doc.data();
    const limitAmount = Number(budget.limitAmount || 0);
    const spentAmount = Number(budget.spentAmount || 0);
    const ratio = limitAmount ? spentAmount / limitAmount : 0;

    if (ratio >= Number(budget.alertThreshold || 0.8)) {
      await db.collection("notifications").add({
        userId: budget.userId,
        title: ratio >= 1 ? "Budget exceeded" : "Budget nearing limit",
        body: `${budget.categoryName} has reached ${Math.round(ratio * 100)}% of its budget.`,
        type: "budget_alert",
        read: false,
        metadata: {
          budgetId: doc.id
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  }
});

export const autoCategorizeTransaction = onCall(async (request) => {
  const userId = requireUser(request.auth);
  const note = String(request.data?.note ?? "");
  const categoriesSnap = await db.collection("categories").where(Filter.or(Filter.where("type", "==", "expense"), Filter.where("type", "==", "income"))).get();
  const categoryId = categorizeFromKeywords(
    note,
    categoriesSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as { name: string; keywords?: string[] }) }))
  );
  await logAdminEvent("auto_categorize", "success", userId, { note, categoryId });
  return { categoryId };
});

export const promoteAdmin = onCall(async (request) => {
  const callerUid = requireUser(request.auth);
  const caller = await getAuth().getUser(callerUid);
  if (!caller.customClaims?.admin) {
    throw new HttpsError("permission-denied", "Only admins can promote other admins.");
  }

  const email = String(request.data?.email ?? "");
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
  await logAdminEvent("promote_admin", "success", callerUid, { email });
  return { ok: true };
});

export const syncBudgetSpentAmounts = onSchedule("every 6 hours", async () => {
  const budgets = await db.collection("budgets").get();
  for (const budgetDoc of budgets.docs) {
    const budget = budgetDoc.data();
    const start = new Date(`${budget.monthKey}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const transactions = await db
      .collection("transactions")
      .where("userId", "==", budget.userId)
      .where("categoryId", "==", budget.categoryId)
      .where("type", "==", "expense")
      .where("occurredAt", ">=", Timestamp.fromDate(start))
      .where("occurredAt", "<", Timestamp.fromDate(end))
      .get();

    const spentAmount = transactions.docs.reduce((sum, doc) => sum + Number(doc.data().amount || 0), 0);
    await budgetDoc.ref.update({
      spentAmount,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
});

