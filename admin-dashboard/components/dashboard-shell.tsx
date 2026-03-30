"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getClientDb } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";
import { AdminCategory, AdminLog, AdminUser } from "@/types";
import { SummaryCard } from "@/components/summary-card";

type TransactionPoint = {
  day: string;
  total: number;
};

export function DashboardShell() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [transactions, setTransactions] = useState<Array<{ amount: number; occurredAt?: { seconds: number } }>>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense");
  const [categoryColor, setCategoryColor] = useState("#11463B");

  useEffect(() => {
    async function load() {
      const adminDb = getClientDb();
      const [userSnap, categorySnap, logSnap, transactionSnap] = await Promise.all([
        getDocs(query(collection(adminDb, "users"), limit(50))),
        getDocs(query(collection(adminDb, "categories"), limit(50))),
        getDocs(query(collection(adminDb, "adminLogs"), orderBy("createdAt", "desc"), limit(25))),
        getDocs(query(collection(adminDb, "transactions"), orderBy("occurredAt", "desc"), limit(200)))
      ]);

      setUsers(userSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AdminUser, "id">) })));
      setCategories(categorySnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AdminCategory, "id">) })));
      setLogs(logSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AdminLog, "id">) })));
      setTransactions(transactionSnap.docs.map((doc) => doc.data() as { amount: number; occurredAt?: { seconds: number } }));
    }

    load().catch(console.error);
  }, []);

  async function handleSaveCategory() {
    const adminDb = getClientDb();
    const id = categoryName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id) {
      return;
    }

    await setDoc(
      doc(adminDb, "categories", id),
      {
        userId: "system",
        name: categoryName,
        type: categoryType,
        color: categoryColor,
        icon: categoryType === "income" ? "wallet" : "receipt",
        keywords: [],
        isSystem: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    const categorySnap = await getDocs(query(collection(adminDb, "categories"), limit(50)));
    setCategories(categorySnap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<AdminCategory, "id">) })));
    setCategoryName("");
  }

  const expenseTotal = useMemo(
    () => transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [transactions]
  );

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions.forEach((item) => {
      if (!item.occurredAt?.seconds) {
        return;
      }
      const date = new Date(item.occurredAt.seconds * 1000);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      grouped.set(key, (grouped.get(key) || 0) + item.amount);
    });

    return Array.from(grouped.entries())
      .slice(-10)
      .map(([day, total]) => ({ day, total }));
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f6f1e8_0%,_#ffffff_45%,_#dff8ef_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-tide">Prime Budget Ops</p>
        <h1 className="mt-3 text-5xl font-black text-obsidian">Admin control center</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Review user growth, transaction velocity, categories, and operational logs without introducing a custom backend.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard title="Users" value={String(users.length)}>Approved sign-ins and mobile profiles.</SummaryCard>
          <SummaryCard title="Tracked Volume" value={formatCurrency(expenseTotal)}>Recent Firestore transaction volume.</SummaryCard>
          <SummaryCard title="Categories" value={String(categories.length)}>System and managed budget categories.</SummaryCard>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr,0.65fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-950/5">
            <h2 className="text-xl font-bold text-obsidian">Transaction trend</h2>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#11463B" stopOpacity={0.75} />
                      <stop offset="95%" stopColor="#11463B" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="day" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#11463B" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[32px] bg-obsidian p-6 text-white shadow-xl shadow-emerald-950/10">
            <h2 className="text-xl font-bold">Recent logs</h2>
            <div className="mt-5 space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{log.event}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">{log.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-100/80">{log.userId || "system"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-950/5">
            <h2 className="text-xl font-bold text-obsidian">Users</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="py-3">{user.displayName}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-950/5">
            <h2 className="text-xl font-bold text-obsidian">Managed categories</h2>
            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
                <select
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  value={categoryType}
                  onChange={(event) => setCategoryType(event.target.value as "income" | "expense")}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  placeholder="#11463B"
                  value={categoryColor}
                  onChange={(event) => setCategoryColor(event.target.value)}
                />
              </div>
              <button className="mt-3 rounded-full bg-tide px-5 py-3 font-semibold text-white" onClick={handleSaveCategory}>
                Save category
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                  <div>
                    <p className="font-semibold text-obsidian">{category.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{category.type}</p>
                  </div>
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
