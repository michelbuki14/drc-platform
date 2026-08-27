import { prisma } from '@/lib/db';

export type Channel = 'email' | 'sms';

export interface DispatchParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  settingKey?: 'bookingConfirmed' | 'flightStatusChange' | 'checkInReminder' | 'priceDropAlert' | 'marketing';
}

export async function dispatchNotification({
  userId,
  type,
  title,
  message,
  data,
}: DispatchParams): Promise<{ notificationId: string; deliveries: never[] }> {
  // Persist the notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ?? null,
    },
  });

  // Simplified: no delivery channel simulation since models don't exist
  // In production, you'd integrate with SendGrid/Twilio here
  
  return { notificationId: notification.id, deliveries: [] };
}
