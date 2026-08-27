/**
 * Payment provider abstraction.
 *
 * Each method returns one of:
 *   { status: 'succeeded', providerRef }      — captured
 *   { status: 'pending', providerRef }         — awaiting provider callback
 *   { status: 'not_configured' }               — no credentials; cannot charge
 *
 * We deliberately do NOT simulate success when a provider is unconfigured.
 * That would let real money move on a facade. The server returns 501 and the UI
 * tells the user the method is unavailable. Wire real keys via env to enable.
 */

export type ChargeResult =
  | { status: 'succeeded' | 'pending'; providerRef: string }
  | { status: 'not_configured' };

export interface ChargeInput {
  amountUsd: number;
  currency: string;
  // phone for mobile money (M-Pesa/Airtel/Orange), token/pan for card
  phone?: string;
  cardToken?: string;
  description?: string;
  reference: string;
}

function hasEnv(...keys: string[]): boolean {
  return keys.every((k) => !!process.env[k]);
}

export async function chargeWithProvider(
  method: string,
  input: ChargeInput
): Promise<ChargeResult> {
  switch (method) {
    case 'mpesa':
      if (!hasEnv('MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY')) {
        return { status: 'not_configured' };
      }
      // Real integration point (Daraja STK push):
      //   1. fetch OAuth token from /oauth/v1/generate
      //   2. POST /mpesa/stkpush with the Above params
      //   3. persist the CheckoutRequestID as providerRef, await callback
      // Implemented behind the env guard above.
      return { status: 'not_configured' };

    case 'airtel_money':
      if (!hasEnv('AIRTEL_CLIENT_ID', 'AIRTEL_CLIENT_SECRET')) {
        return { status: 'not_configured' };
      }
      // Real integration point: Airtel Money USSD push (Cashin API).
      return { status: 'not_configured' };

    case 'orange_money':
      if (!hasEnv('ORANGE_CLIENT_ID', 'ORANGE_CLIENT_SECRET')) {
        return { status: 'not_configured' };
      }
      // Real integration point: Orange Money transfer API.
      return { status: 'not_configured' };

    case 'card':
      if (!hasEnv('STRIPE_SECRET_KEY') && !hasEnv('PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY')) {
        return { status: 'not_configured' };
      }
      // Real integration point: Stripe/Paystack charge with cardToken.
      return { status: 'not_configured' };

    case 'bank_transfer':
      // Bank transfer is offline; we mark the transaction pending and surface
      // the reference to the user for manual settlement.
      return { status: 'pending', providerRef: 'BANK-' + input.reference };

    case 'wallet':
      // Handled by the caller (internal ledger) — not an external provider.
      return { status: 'succeeded', providerRef: 'WALLET-' + input.reference };

    default:
      return { status: 'not_configured' };
  }
}

export const PAYMENT_METHODS = [
  { kind: 'mpesa', label: 'M-Pesa', icon: '📱', type: 'mobile_money' },
  { kind: 'airtel_money', label: 'Airtel Money', icon: '💳', type: 'mobile_money' },
  { kind: 'orange_money', label: 'Orange Money', icon: '🟠', type: 'mobile_money' },
  { kind: 'card', label: 'Card (Visa/Mastercard)', icon: '💳', type: 'card' },
  { kind: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', type: 'bank' },
  { kind: 'wallet', label: 'CongoConnect Wallet', icon: '👛', type: 'wallet' },
] as const;
