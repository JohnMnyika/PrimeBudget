# Firestore Schema

## Collections

### `users/{userId}`
```json
{
  "userId": "uid",
  "email": "user@example.com",
  "displayName": "Amina Njeri",
  "photoURL": "",
  "currency": "KES",
  "theme": "system",
  "timezone": "Africa/Nairobi",
  "fcmTokens": ["token-1"],
  "biometricEnabled": true,
  "defaultAccountId": "cash-main",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `transactions/{transactionId}`
```json
{
  "userId": "uid",
  "type": "expense",
  "amount": 1250,
  "currency": "KES",
  "categoryId": "food",
  "categoryName": "Food & Dining",
  "accountId": "m-pesa-main",
  "accountName": "M-Pesa",
  "notes": "Lunch meeting",
  "isRecurring": false,
  "recurrenceRule": null,
  "predictedCategoryId": "food",
  "source": "manual",
  "occurredAt": "Timestamp",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `budgets/{budgetId}`
```json
{
  "userId": "uid",
  "monthKey": "2026-03",
  "categoryId": "food",
  "categoryName": "Food & Dining",
  "limitAmount": 15000,
  "spentAmount": 11450,
  "alertThreshold": 0.8,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `goals/{goalId}`
```json
{
  "userId": "uid",
  "name": "Emergency Fund",
  "targetAmount": 300000,
  "savedAmount": 120000,
  "targetDate": "Timestamp",
  "status": "active",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `categories/{categoryId}`
```json
{
  "userId": "system",
  "name": "Food & Dining",
  "type": "expense",
  "icon": "utensils",
  "color": "#FF7A59",
  "keywords": ["restaurant", "lunch", "dinner"],
  "isSystem": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `notifications/{notificationId}`
```json
{
  "userId": "uid",
  "title": "Budget Alert",
  "body": "Food budget is 85% used.",
  "type": "budget_alert",
  "read": false,
  "metadata": {
    "budgetId": "budget_food"
  },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `adminLogs/{logId}`
```json
{
  "event": "mpesa_stk_push",
  "status": "success",
  "userId": "uid",
  "details": {
    "checkoutRequestId": "ws_co_123"
  },
  "createdAt": "Timestamp"
}
```
