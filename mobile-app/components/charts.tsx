import { Dimensions, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Budget, Transaction } from "@/types";

const screenWidth = Dimensions.get("window").width - 56;

export function SpendLineChart({ transactions }: { transactions: Transaction[] }) {
  const expenseTransactions = transactions.filter((item) => item.type === "expense").slice(0, 7).reverse();
  return (
    <LineChart
      data={{
        labels: expenseTransactions.map((item) => item.occurredAt.toLocaleDateString("en-KE", { day: "numeric" })),
        datasets: [{ data: expenseTransactions.map((item) => item.amount || 0) }]
      }}
      width={screenWidth}
      height={220}
      chartConfig={{
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(29, 111, 95, ${opacity})`,
        labelColor: () => "#54635D",
        decimalPlaces: 0,
        propsForDots: { r: "5", strokeWidth: "2", stroke: "#1D6F5F" }
      }}
      bezier
      style={{ borderRadius: 24 }}
    />
  );
}

export function BudgetPieChart({ budgets }: { budgets: Budget[] }) {
  const data = budgets.map((budget, index) => ({
    name: budget.categoryName,
    amount: budget.spentAmount || 1,
    color: ["#1D6F5F", "#FF7A59", "#0EA5A0", "#3674B5", "#F7B801"][index % 5],
    legendFontColor: "#1E2C28",
    legendFontSize: 12
  }));

  return (
    <View className="items-center">
      <PieChart
        data={data.length ? data : [{ name: "No data", amount: 1, color: "#D8E3DF", legendFontColor: "#54635D", legendFontSize: 12 }]}
        width={screenWidth}
        height={220}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute
        chartConfig={{
          color: () => "#1D6F5F"
        }}
      />
    </View>
  );
}

