export function formatCurrency(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

