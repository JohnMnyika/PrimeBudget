# Environment Variables

## Mobile app
Copy `mobile-app/.env.example` to `mobile-app/.env`.

## Admin dashboard
Copy `admin-dashboard/.env.example` to `admin-dashboard/.env.local`.

## Firebase Functions
Set secrets:

```bash
firebase functions:secrets:set MPESA_CONSUMER_KEY
firebase functions:secrets:set MPESA_CONSUMER_SECRET
firebase functions:secrets:set MPESA_PASSKEY
firebase functions:secrets:set MPESA_SHORTCODE
firebase functions:secrets:set OPENAI_API_KEY
```
