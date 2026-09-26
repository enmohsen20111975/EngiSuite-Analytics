/**
 * EngiSuite — m2y.net Subscription Sync Client
 *
 * Called from Express routes (payment.routes.ts, subscriptions.routes.ts)
 * to push subscription state changes to the m2y.net central gateway.
 */

const M2Y_API_URL = process.env.M2Y_API_URL || process.env.MAIN_DOMAIN || 'https://m2y.net';
const M2Y_SYNC_SECRET = process.env.M2Y_SYNC_SECRET || process.env.SHARED_SECRET || '';

export interface EngiSyncPayload {
  action: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel';
  user_id: number;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  expires_at?: string;
  auto_renew?: boolean;
  payment_method?: string;
  transaction_id?: string;
  metadata?: object;
}

/**
 * Push a subscription event to m2y.net.
 * Returns true on success, false on failure (never throws).
 */
export async function syncSubscriptionToM2Y(payload: EngiSyncPayload): Promise<boolean> {
  if (!M2Y_SYNC_SECRET) {
    console.warn('[Engi-Sync] M2Y_SYNC_SECRET not set — skipping sync');
    return false;
  }

  if (!M2Y_API_URL || M2Y_API_URL.includes('localhost')) {
    console.info('[Engi-Sync] m2y.net not a real URL — sync skipped in dev');
    return false;
  }

  try {
    const res = await fetch(`${M2Y_API_URL}/api/sync/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type':     'application/json',
        'X-M2Y-Source':     'engsuite',
        'X-M2Y-Sync-Secret': M2Y_SYNC_SECRET,
      },
      body: JSON.stringify({
        ...payload,
        user_id: String(payload.user_id),  // m2y.net stores as string
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Engi-Sync] m2y.net returned ${res.status}`);
      return false;
    }

    const data = await res.json().catch(() => ({}));
    console.info(
      `[Engi-Sync] OK action=${payload.action} plan=${payload.plan_id} user=${payload.user_id}`
    );
    return (data as any).success === true;
  } catch (err) {
    console.warn('[Engi-Sync] Failed:', (err as Error).message);
    return false;
  }
}

/**
 * Check subscription in m2y.net for EngiSuite subdomain cross-verification.
 */
export async function getEngiSubscriptionFromM2Y(userId: number): Promise<any> {
  if (!M2Y_SYNC_SECRET || !M2Y_API_URL || M2Y_API_URL.includes('localhost')) {
    return null;
  }
  try {
    const res = await fetch(
      `${M2Y_API_URL}/api/verify-subscription?source=engsuite&external_user_id=${userId}`,
      { headers: { 'X-M2Y-Sync-Secret': M2Y_SYNC_SECRET }, signal: AbortSignal.timeout(8000) }
    );
    return res.ok ? await res.json() : null;
  } catch { return null; }
}
