export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  currency: string;
  createdAt?: { seconds: number };
};

export type AdminCategory = {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  isSystem: boolean;
};

export type AdminLog = {
  id: string;
  event: string;
  status: string;
  userId?: string;
  createdAt?: { seconds: number };
  details?: Record<string, string>;
};
