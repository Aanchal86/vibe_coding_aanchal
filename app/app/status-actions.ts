'use server';

import { env } from 'cloudflare:workers';

export interface ToggleStatusResult {
  success: boolean;
  message: string;
  isActive?: boolean;
}

interface StatusRow {
  service_name: string;
  is_active: number;
}

export async function toggleSubscriptionStatus(
  subscriptionId: string,
): Promise<ToggleStatusResult> {
  if (
    typeof subscriptionId !== 'string' ||
    subscriptionId.trim() === ''
  ) {
    return {
      success: false,
      message: 'Invalid subscription.',
    };
  }

  try {
    const existingSubscription =
      await env.DB.prepare(`
        SELECT service_name, is_active
        FROM subscriptions
        WHERE id = ?
      `)
        .bind(subscriptionId)
        .first<StatusRow>();

    if (!existingSubscription) {
      return {
        success: false,
        message: 'Subscription could not be found.',
      };
    }

    const nextStatus =
      existingSubscription.is_active === 1 ? 0 : 1;

    await env.DB.prepare(`
      UPDATE subscriptions
      SET is_active = ?
      WHERE id = ?
    `)
      .bind(nextStatus, subscriptionId)
      .run();

    const isActive = nextStatus === 1;

    return {
      success: true,
      isActive,
      message: `${existingSubscription.service_name} is now ${
        isActive ? 'active' : 'paused'
      }.`,
    };
  } catch (error) {
    console.error(
      'Failed to update subscription status:',
      error,
    );

    return {
      success: false,
      message:
        'The subscription status could not be updated.',
    };
  }
}