import { formatCurrency, getMonthKey } from "@/lib/utils";

describe("utils", () => {
  it("formats currency", () => {
    expect(formatCurrency(1000, "KES")).toContain("1,000");
  });

  it("builds month key", () => {
    expect(getMonthKey(new Date("2026-03-15"))).toBe("2026-03");
  });
});
