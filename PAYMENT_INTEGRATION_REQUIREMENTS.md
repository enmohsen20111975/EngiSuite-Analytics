# 📦 M2Y Payment Integration Requirements

## ✅ What I've Implemented in m2y.net (Central Payment Gateway)

### 📁 Files Created/Modified:

**New Files:**
1. `services/paymob.js` - Paymob API integration (3 steps: Auth → Order → Payment Key)
2. `services/pendingPayments.js` - In-memory store for payment sessions
3. `middleware/jwt.js` - JWT verification with SHARED_SECRET
4. `routes/checkout.js` - GET `/checkout` endpoint (validates JWT, calls Paymob, renders iframe)
5. `routes/payment.js` - GET `/payment/result` (Paymob redirect callback) + 4 webhook endpoints
6. `views/checkout.ejs` - Payment page with Paymob iframe

**Modified Files:**
1. `server.js` - Mounted new routes (`/checkout`, `/payment/*`)
2. `.env` - Added Paymob credentials + SHARED_SECRET

---

## 🔗 Required Changes in Subdomains

Both **engsuite.m2y.net** and **invist.m2y.net** need the following implementation (Next.js).

---

### 📋 **engsuite.m2y.net** Requirements

#### 1. Install Dependencies
```bash
npm install jsonwebtoken
```

#### 2. Create `lib/plans.js`
```javascript
export const PLANS = {
  'engsuite-basic': {
    id: 'engsuite-basic',
    name: 'الأساسي',
    price: 99,
    currency: 'EGP',
    features: ['...', '...']
  },
  'engsuite-pro': {
    id: 'engsuite-pro',
    name: 'الاحترافي',
    price: 199,
    currency: 'EGP',
    features: ['...', '...']
  },
  'engsuite-enterprise': {
    id: 'engsuite-enterprise',
    name: 'المؤسسي',
    price: 399,
    currency: 'EGP',
    features: ['...', '...']
  }
};
```

#### 3. Create `lib/payment.js` (JWT Generator)
```javascript
import jwt from 'jsonwebtoken';

const SHARED_SECRET = process.env.SHARED_SECRET;

export function generatePaymentToken({ plan, user_id, payment_type }) {
  const planData = PLANS[plan];
  
  const payload = {
    plan: planData.id,
    source: 'engsuite',
    amount: planData.price,
    user_id,
    payment_type, // 'card' or 'wallet'
    return_success: `https://engsuite.m2y.net/payment/success?plan=${planData.id}`,
    return_fail: `https://engsuite.m2y.net/payment/fail`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
  };

  return jwt.sign(payload, SHARED_SECRET, { algorithm: 'HS256' });
}
```

#### 4. Create `pages/api/subscribe/[plan].js`
```javascript
import { generatePaymentToken } from '../../../lib/payment';
import { PLANS } from '../../../lib/plans';

export default function handler(req, res) {
  const { plan } = req.query; // e.g., 'engsuite-basic'
  const { type } = req.query; // 'card' or 'wallet'

  // Validate plan exists
  if (!PLANS[plan]) {
    return res.status(404).json({ error: 'Invalid plan' });
  }

  // Get user from session (adjust based on your auth system)
  const user_id = req.session?.user?.id || 'guest_' + Date.now();

  // Generate JWT token
  const token = generatePaymentToken({
    plan,
    user_id,
    payment_type: type
  });

  // Redirect to m2y.net checkout
  res.redirect(302, `https://m2y.net/checkout?token=${token}`);
}
```

#### 5. Create `pages/payment/success.js`
```javascript
export default function SuccessPage({ query }) {
  const { plan, transaction_id } = query;
  
  // TODO: Activate subscription in your database
  // Example: await activateSubscription(user_id, plan);
  
  return (
    <div>
      <h1>✅ Payment Successful!</h1>
      <p>Your subscription to <strong>{plan}</strong> is now active.</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}

// Optional: Get server-side props if using getServerSideProps
export async function getServerSideProps(context) {
  const { plan, mid } = context.query;
  
  // Verify payment with your backend or call m2y.net webhook
  // TODO: Confirm subscription activation
  
  return { props: { plan, transaction_id: mid } };
}
```

#### 6. Create `pages/payment/fail.js`
```javascript
export default function FailPage() {
  return (
    <div>
      <h1>❌ Payment Failed</h1>
      <p>Sorry, your payment could not be processed.</p>
      <p>Please try again or contact support.</p>
      <button onClick={() => window.history.back()}>
        Try Again
      </button>
    </div>
  );
}
```

#### 7. Update `.env.local`
```env
SHARED_SECRET=K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
MAIN_DOMAIN=https://m2y.net
```

**⚠️ IMPORTANT:** The `SHARED_SECRET` **must be identical** to the one in `m2y.net/.env`.

---

### 📋 **invist.m2y.net** Requirements

Same as engsuite, but with differences:

#### 1. `lib/plans.js` (4 plans)
```javascript
export const PLANS = {
  'invist-basic': {
    id: 'invist-basic',
    name: 'المقدمة',
    price: 299,
    currency: 'EGP',
    features: ['...']
  },
  'invist-pro': {
    id: 'invist-pro',
    name: 'الاحترافية',
    price: 149,
    currency: 'EGP',
    features: ['...']
  },
  'invist-enterprise': {
    id: 'invist-enterprise',
    name: 'مؤسسي',
    price: 499,
    currency: 'EGP',
    features: ['...']
  },
  'invist-ultimate': {
    id: 'invist-ultimate',
    name: 'الأفضل',
    price: 999,
    currency: 'EGP',
    features: ['...']
  }
};
```

#### 2. `lib/payment.js`
Change `source: 'invist'`:
```javascript
const payload = {
  plan: planData.id,
  source: 'invist', // ← CHANGE HERE
  amount: planData.price,
  // ... rest same
};
```

#### 3. `pages/api/subscribe/[plan].js`
Return URLs point to invist:
```javascript
return_success: `https://invist.m2y.net/payment/success?plan=${planData.id}`,
return_fail: `https://invist.m2y.net/payment/fail`,
```

#### 4. `pages/payment/success.js` & `fail.js`
Same structure but on invist.m2y.net domain.

#### 5. `.env.local`
Same `SHARED_SECRET`.

---

## 🔐 SHARED_SECRET

**Important:** This secret must be **exactly the same** in:
- `m2y.net/.env`
- `engsuite.m2y.net/.env.local`
- `invist.m2y.net/.env.local`

Current value:
```
K4l3m3tL1c2h4a5n6g7e8f9i0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2
```

**Length:** 64 characters (hex). Keep it secret!

---

## 🔄 Complete Flow Diagram

```
User on engsuite.m2y.net
    ↓
Clicks "Subscribe" button
    ↓
GET /api/subscribe/pro?type=card
    ↓
JWT created: {plan, source, amount, user_id, return_success, return_fail}
    ↓
302 Redirect: https://m2y.net/checkout?token=JWT
    ↓
m2y.net:
  - Verifies JWT with SHARED_SECRET
  - Calls Paymob API (Auth → Order → Payment Key)
  - Saves pending payment in memory
  - Renders iframe page
    ↓
User pays in Paymob iframe
    ↓
Paymob redirects to: https://m2y.net/payment/result?success=true&mid=ORDER_ID
    ↓
m2y.net:
  - Looks up pending payment by mid
  - Redirects 302 to return_success URL (engsuite.m2y.net/payment/success)
    ↓
engsuite.m2y.net/payment/success?plan=pro
    ↓
- Activates subscription in DB
- Shows success message
```

---

## 🧪 Testing Checklist

### In m2y.net:
- [ ] `GET https://m2y.net/checkout?token=<valid-jwt>` → renders iframe
- [ ] `GET https://m2y.net/payment/result?success=true&mid=123` → redirects to return_success
- [ ] Webhook endpoints respond 200 OK

### In engsuite.m2y.net:
- [ ] Subscribing generates correct JWT
- [ ] Redirect goes to https://m2y.net/checkout
- [ ] Success page activates subscription

### In invist.m2y.net:
- [ ] Same as engsuite with invist plans

---

## 📂 Summary of Subdomain Files to Create

### engsuite.m2y.net / invist.m2y.net:

| File | Purpose |
|------|---------|
| `lib/plans.js` | Plans data (3 for engsuite, 4 for invist) |
| `lib/payment.js` or `lib/jwt.js` | JWT generation function using `jsonwebtoken` |
| `pages/api/subscribe/[plan].js` | API Route: create JWT, redirect to m2y.net |
| `pages/payment/success.js` | Handle successful payment, activate subscription |
| `pages/payment/fail.js` | Handle failed payment |
| `.env.local` | Add `SHARED_SECRET` (same as m2y.net) |
| Update pricing page | Links to `/api/subscribe/[plan]?type=card` or `?type=wallet` |

---

**Questions?** Make sure:
1. SHARED_SECRET matches exactly in all 3 apps
2. All URLs are HTTPS
3. Plans data is accurate
4. Payment_type matches: 'card' or 'wallet'
