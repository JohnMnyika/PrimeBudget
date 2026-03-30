import { defineSecret } from "firebase-functions/params";

const MPESA_CONSUMER_KEY = defineSecret("MPESA_CONSUMER_KEY");
const MPESA_CONSUMER_SECRET = defineSecret("MPESA_CONSUMER_SECRET");
const MPESA_PASSKEY = defineSecret("MPESA_PASSKEY");
const MPESA_SHORTCODE = defineSecret("MPESA_SHORTCODE");

export const mpesaSecrets = [MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE];

export async function getMpesaAccessToken() {
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY.value()}:${MPESA_CONSUMER_SECRET.value()}`).toString("base64");
  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with M-Pesa.");
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

export async function initiateStkPush(payload: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  description: string;
}) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE.value()}${MPESA_PASSKEY.value()}${timestamp}`).toString("base64");

  const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      BusinessShortCode: MPESA_SHORTCODE.value(),
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: payload.amount,
      PartyA: payload.phoneNumber,
      PartyB: MPESA_SHORTCODE.value(),
      PhoneNumber: payload.phoneNumber,
      CallBackURL: "https://us-central1-primebudget-ef682.cloudfunctions.net/mpesaCallback",
      AccountReference: payload.accountReference,
      TransactionDesc: payload.description
    })
  });

  if (!response.ok) {
    throw new Error("M-Pesa STK push request failed.");
  }

  return response.json();
}
