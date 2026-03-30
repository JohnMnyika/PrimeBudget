import { Category } from "@/types";

export const defaultCategories: Category[] = [
  { id: "salary", userId: "system", name: "Salary", type: "income", icon: "wallet", color: "#1D6F5F", keywords: ["salary", "payroll"], isSystem: true },
  { id: "business", userId: "system", name: "Business", type: "income", icon: "briefcase", color: "#0F3D33", keywords: ["business", "client"], isSystem: true },
  { id: "food", userId: "system", name: "Food & Dining", type: "expense", icon: "utensils", color: "#FF7A59", keywords: ["food", "lunch", "dinner", "restaurant"], isSystem: true },
  { id: "transport", userId: "system", name: "Transport", type: "expense", icon: "car", color: "#3674B5", keywords: ["uber", "fuel", "matatu", "transport"], isSystem: true },
  { id: "housing", userId: "system", name: "Housing", type: "expense", icon: "house", color: "#7C4DFF", keywords: ["rent", "mortgage"], isSystem: true },
  { id: "utilities", userId: "system", name: "Utilities", type: "expense", icon: "bolt", color: "#F7B801", keywords: ["electricity", "water", "internet"], isSystem: true },
  { id: "savings", userId: "system", name: "Savings", type: "expense", icon: "target", color: "#0EA5A0", keywords: ["saving", "reserve"], isSystem: true },
  { id: "health", userId: "system", name: "Health", type: "expense", icon: "heart-pulse", color: "#E63946", keywords: ["hospital", "medicine"], isSystem: true }
];
