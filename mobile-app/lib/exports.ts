import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";

export async function exportTransactionsCsv(transactions: Transaction[], currency: string) {
  const csv = [
    "Date,Type,Category,Amount,Account,Notes",
    ...transactions.map((item) =>
      [
        item.occurredAt.toISOString(),
        item.type,
        item.categoryName,
        item.amount,
        item.accountName,
        item.notes?.replaceAll(",", " ") ?? ""
      ].join(",")
    )
  ].join("\n");

  const path = `${FileSystem.cacheDirectory}prime-budget-transactions.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: "text/csv" });
  }

  return path;
}

export async function exportTransactionsPdf(transactions: Transaction[], currency: string) {
  const rows = transactions
    .map(
      (item) => `
        <tr>
          <td>${item.occurredAt.toLocaleDateString()}</td>
          <td>${item.categoryName}</td>
          <td>${item.type}</td>
          <td>${formatCurrency(item.amount, currency)}</td>
          <td>${item.accountName}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <html>
      <body style="font-family: Helvetica; padding: 24px;">
        <h1>Prime Budget Report</h1>
        <table width="100%" cellspacing="0" cellpadding="8" border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
  }

  return uri;
}

