import { readFile } from "node:fs/promises";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();
const basePath = new URL(".", import.meta.url);

async function loadJson(file) {
  const text = await readFile(new URL(file, basePath), "utf8");
  return JSON.parse(text);
}

function normalize(value) {
  if (typeof value === "string" && /\d{4}-\d{2}-\d{2}T/.test(value)) {
    return Timestamp.fromDate(new Date(value));
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, normalize(inner)]));
  }
  return value;
}

async function seedCollection(name, docs) {
  for (const item of docs) {
    const id = item.id || db.collection(name).doc().id;
    const payload = {
      ...normalize(item),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    delete payload.id;
    await db.collection(name).doc(id).set(payload, { merge: true });
  }
}

await seedCollection("categories", await loadJson("./categories.json"));
await seedCollection("users", await loadJson("./users.json"));
await seedCollection("transactions", await loadJson("./transactions.json"));
await seedCollection("budgets", await loadJson("./budgets.json"));
await seedCollection("goals", await loadJson("./goals.json"));
await seedCollection("notifications", await loadJson("./notifications.json"));

console.log("Sample data seeded.");

