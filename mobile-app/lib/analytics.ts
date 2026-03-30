import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { AnalysisSummary } from "@/types";

export async function runBudgetAnalysis(): Promise<AnalysisSummary> {
  const fn = httpsCallable(functions, "analyzeBudgetPatterns");
  const result = await fn();
  return result.data as AnalysisSummary;
}

export async function requestMpesaTopUp(payload: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  description: string;
}) {
  const fn = httpsCallable(functions, "initiateMpesaPayment");
  const result = await fn(payload);
  return result.data;
}
