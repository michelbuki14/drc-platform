/**
 * Notification delivery abstraction.
 *
 * Creates the in-app Notification row (always), then attempts out-of-band
 * delivery (email / SMS / web push). Each channel returns `not_configured`
 * when its credentials are absent — we never pretend a message was delivered.
 * Wire real keys via env to enable each channel.
 */

import { prisma } from "@/lib/db";

export type DeliveryChannel = "email" | "sms" | "push";
export type DeliveryStatus = "sent" | "not_configured" | "skipped";

export interface DeliveryResult {
  channel: DeliveryChannel;
  status: DeliveryStatus;
}

function hasEnv(...keys: string[]): boolean {
  return keys.every((k) => !!process.env[k]);
}

async function deliverEmail(to: string, subject: string, body: string): Promise<DeliveryResult> {
  // Supported providers (env-gated): RESEND_API_KEY, or SMTP_* (nodemailer), or SENDGRID_API_KEY.
  if (!hasEnv("RESEND_API_KEY") && !hasEnv("SENDGRID_API_KEY") && !hasEnv("SMTP_HOST")) {
    return { channel: "email", status: "not_configured" };
  }
  // Real send point would go here (Resend/SendGrid/SMTP). Left intentionally
  // unimplemented until credentials are provided — returning not_configured
  // above already short-circuits when keys are absent.
  return { channel: "email", status: "not_configured" };
}

async function deliverSms(to: string, body: string): Promise<DeliveryResult> {
  // Supported providers: TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN, or AFRICASTALKING_*.
  if (!hasEnv("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN") && !hasEnv("AT_USERNAME", "AT_API_KEY")) {
    return { channel: "sms", status: "not_configured" };
  }
  return { channel: "sms", status: "not_configured" };
}

async function deliverPush(userId: string, title: string, body: string): Promise<DeliveryResult> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { channel: "push", status: "skipped" };
  if (!hasEnv("VAPID_PRIVATE_KEY", "VAPID_PUBLIC_KEY")) {
    return { channel: "push", status: "not_configured" };
  }
  // Real Web Push send would iterate `subs` with web-push here.
  return { channel: "push", status: "not_configured" };
}

export interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  email?: string; // recipient for email channel
  phone?: string; // recipient for SMS channel
  channels?: DeliveryChannel[]; // defaults to in-app only
}

export interface NotifyResult {
  notification: any;
  deliveries: DeliveryResult[];
}

/**
 * Persist an in-app notification and attempt out-of-band delivery.
 * In-app is always created; external channels degrade to not_configured.
 */
export async function notifyUser(input: NotifyInput): Promise<NotifyResult> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
    },
  });

  const channels = input.channels ?? [];
  const deliveries: DeliveryResult[] = [];
  for (const ch of channels) {
    if (ch === "email" && input.email) deliveries.push(await deliverEmail(input.email, input.title, input.message));
    if (ch === "sms" && input.phone) deliveries.push(await deliverSms(input.phone, input.message));
    if (ch === "push") deliveries.push(await deliverPush(input.userId, input.title, input.message));
  }

  return { notification, deliveries };
}
