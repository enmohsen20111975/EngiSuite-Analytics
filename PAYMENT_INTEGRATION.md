# Payment Integration Documentation

## Overview

This document describes the payment integration architecture for EngiSuite and Invist platforms using the M2Y central payment gateway.

## Architecture

The payment system follows a microservices architecture with a central gateway (`m2y.net`) handling payment processing and subdomains (`engsuite.m2y.net`, `invist.m2y.net`) initiating payment requests.

### Components

1. **Central Gateway (m2y.net)**
   - Handles Paymob payment integration
   - Verifies JWT tokens from subdomains
   - Processes payments and returns results
   - Main endpoints:
     - `GET /api/checkout` - Render payment iframe
     - `POST /api/payments/result` - Payment callback
     - `POST /api/payments/paymob/process` - Create Paymob order

2. **Subdomains (engsuite/invist)**
   - Generate JWT payment tokens
   - Redirect users to central gateway
   - Handle payment success/failure callbacks
   - Activate subscriptions upon success

## Flow Diagram

```
User on engsuite.m2y.net
     |
     v
Clicks "Subscribe" (pro plan, card payment)
     |
     v
GET /api/subscribe/pro?type=card
     |
     v
JWT created: {plan, source, amount, user_id, payment_type, return_success, return_fail}
     |
     v
302 Redirect: https://m2y.net/checkout?token=JWT
     |
     v
m2y.net: Verify JWT with SHARED_SECRET
     |
     v
     - Call Paymob API (Auth → Order → Payment Key)
     - Save pending payment in DB
     - Render iframe page
     |
     v
User pays in Paymob iframe
     |
     v
Paymob redirects to: https://m2y.net/payment/result?success=true&mid=123
     |
     v
m2y.net:
  - Lookup pending payment by mid
  - Update status to completed
  - Activate subscription in DB
  - Redirect 302 to return_success URL
     |
     v
engsuite.m2y.net/payment/success?plan=pro&mid=123
     |
     v
- Show success message
- Activate subscription in local DB
- Unlock premium features
```

## JWT Token Structure

```javascript
{
  plan: "engsuite-pro",        // Plan identifier
  source: "engsuite",          // Source application
  amount: 199,                 // Amount in EGP
  user_id: 123,                // User identifier
  payment_type: "card",        // 'card' or 'wallet'
  return_success: "https://engsuite.m2y.net/payment/success?plan=engsuite-pro",
  return_fail: "https://engsuite.m2y.net/payment/fail",
  iat: 1234567890,             // Issued at (Unix timestamp)
  exp: 1234569690              // Expires at (Unix timestamp)
}
```

## Configuration

### Shared Secret

The `SHARED_SECRET` must be **identical** across all three applications:

**m2y.net/.env**
```env
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
```

**engsuite.m2y.net/.env.local**
```env
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
MAIN_DOMAIN=https://m2y.net
```

**invist.m2y.net/.env.local**
```env
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
MAIN_DOMAIN=https://m2y.net
```

⚠️ **Critical**: The secret must match exactly. Any mismatch will cause token verification to fail.

## API Endpoints

### Central Gateway (m2y.net)

#### GET /api/checkout
Verify JWT and render payment page.

**Query Parameters:**
- `token` (required): JWT payment token

**Response:**
```json
{
  "success": true,
  "data": {
    "source": "engsuite",
    "plan": "engsuite-pro",
    "amount": 199,
    "userId": 123,
    "paymentType": "card",
    "returnSuccess": "https://engsuite.m2y.net/payment/success",
    "returnFail": "https://engsuite.m2y.net/payment/fail",
    "paymob": {
      "integrationId": "your-integration-id",
      "iframeId": "your-iframe-id",
      "apiKey": "your-api-key"
    }
  }
}
```

#### POST /api/payments/paymob/process
Create Paymob payment order.

**Request Body:**
```json
{
  "amount": 199,
  "plan": "engsuite-pro",
  "user_id": 123,
  "source": "engsuite"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": 456,
    "paymentKey": "paymob_test_123456",
    "iframeId": "your-iframe-id",
    "amount": 199,
    "currency": "EGP"
  }
}
```

#### POST /api/payments/result
Payment result callback from Paymob.

**Request Body (success):**
```json
{
  "success": true,
  "mid": "123456",
  "order_id": "ORDER_123"
}
```

**Response:**
```json
{
  "received": true,
  "success": true,
  "redirect": "https://engsuite.m2y.net/payment/success?plan=engsuite-pro&mid=123456"
}
```

#### POST /api/payments/result (failure)
```json
{
  "success": false,
  "mid": "123456"
}
```

**Response:**
```json
{
  "received": true,
  "success": false,
  "redirect": "https://engsuite.m2y.net/payment/fail"
}
```

#### GET /api/payments/methods
Get available payment methods.

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "paymob",
        "name": "Paymob",
        "currencies": ["EGP"],
        "regions": ["EG"]
      },
      {
        "id": "stripe",
        "name": "Credit Card (Stripe)",
        "currencies": ["USD"],
        "regions": ["*"]
      }
    ]
  }
}
```

### Subdomain Applications (engsuite/invist)

#### GET /api/subscribe/{plan}
Initiate subscription for a specific plan.

**Parameters:**
- `plan` (path): Plan identifier (e.g., 'engsuite-pro')
- `type` (query): Payment type ('card' or 'wallet')

**Response:**
```
302 Redirect to https://m2y.net/checkout?token=JWT
```

#### POST /api/payments/webhook/stripe
Stripe webhook endpoint.

#### GET /api/payments/history
Get payment history for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tier": "pro",
      "amount": 199,
      "currency": "EGP",
      "action": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/payments/cancel
Cancel current subscription.

## Security Considerations

### 1. JWT Security
- Tokens expire after 30 minutes
- Use HTTPS for all communication
- Store tokens securely (HttpOnly cookies preferred)
- Validate token signature on every request

### 2. Payment Security
- Never expose Paymob API keys in client-side code
- Verify webhook signatures from Paymob
- Use HTTPS for all payment-related endpoints
- Implement rate limiting on payment endpoints

### 3. Shared Secret
- Rotate SHARED_SECRET periodically
- Never commit secrets to version control
- Use environment variables for sensitive data
- Restrict access to .env files

## Implementation Files

### Backend
- `src/routes/payment.routes.ts` - Main payment routes
- `src/middleware/auth.middleware.ts` - JWT verification
- `src/config/constants.ts` - Configuration constants

### Frontend
- `frontend-react/src/services/subscriptionService.js` - Subscription management
- `frontend-react/src/pages/SubscriptionPage.jsx` - Subscription UI
- `frontend-react/src/pages/PricingPage.jsx` - Pricing page

### Shared
- `lib/plans.js` - EngSuite plan definitions
- `lib/invist-plans.js` - Invist plan definitions
- `lib/payment.js` - JWT generation utilities

## Testing Checklist

### M2Y Central Gateway
- [ ] `GET /api/checkout?token=<valid-jwt>` returns payment page
- [ ] `GET /api/checkout?token=<invalid-jwt>` returns 401
- [ ] `POST /api/payments/result` processes successful payments
- [ ] `POST /api/payments/result` processes failed payments
- [ ] Webhook endpoints respond 200 OK
- [ ] Subscription status updates correctly on payment

### EngSuite
- [ ] JWT generation with correct payload
- [ ] Redirect to m2y.net with valid token
- [ ] Success page activates subscription
- [ ] Failed payment handled gracefully

### Invist
- [ ] Same as EngSuite with Invist plans
- [ ] 4 plan options available
- [ ] Correct payment type in JWT

## Troubleshooting

### Token Verification Failed
- Check SHARED_SECRET matches across all apps
- Verify token hasn't expired (30 min limit)
- Check system clocks are synchronized

### Payment Not Processing
- Verify Paymob API credentials
- Check network connectivity to Paymob
- Review Paymob dashboard for error details

### Subscription Not Activated
- Check database connectivity
- Verify webhook endpoint is reachable
- Review application logs for errors

## Environment Variables

### Required for All Apps
```env
SHARED_SECRET=your-64-char-secret
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Central Gateway Only
```env
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret
```

### Stripe (Optional)
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Support

For issues with payment integration:
1. Check browser console for client-side errors
2. Review server logs for backend errors
3. Verify Paymob dashboard for payment status
4. Confirm SHARED_SECRET matches across apps
5. Test with sandbox/test credentials first

## License

Internal use only. Proprietary to EngiSuite/Invist platforms.
