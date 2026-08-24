'use server';

import { env } from 'cloudflare:workers';

type BillingCycle = 'MONTHLY' | 'YEARLY';

interface SubscriptionInput {
  serviceName?: unknown;
  cost?: unknown;
  billingCycle?: unknown;
  nextRenewalDate?: unknown;
}

export interface AddSubscriptionResult {
  success: boolean;
  message: string;
}

const FIXED_CURRENT_DATE = '2026-08-24';

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function addSubscription(
  input: SubscriptionInput,
): Promise<AddSubscriptionResult> {
  const serviceName =
    typeof input.serviceName === 'string' ? input.serviceName.trim() : '';

  const cost =
    typeof input.cost === 'string' || typeof input.cost === 'number'
      ? Number(input.cost)
      : Number.NaN;

  const billingCycle = input.billingCycle as BillingCycle;

  const nextRenewalDate =
    typeof input.nextRenewalDate === 'string'
      ? input.nextRenewalDate
      : '';

  if (serviceName.length < 2 || serviceName.length > 60) {
    return {
      success: false,
      message: 'Service name must contain between 2 and 60 characters.',
    };
  }

  if (!Number.isFinite(cost) || cost <= 0) {
    return {
      success: false,
      message: 'Cost must be greater than zero.',
    };
  }

  if (!['MONTHLY', 'YEARLY'].includes(billingCycle)) {
    return {
      success: false,
      message: 'Please select a valid billing cycle.',
    };
  }

  if (!isValidDate(nextRenewalDate)) {
    return {
      success: false,
      message: 'Please provide a valid renewal date.',
    };
  }

  if (nextRenewalDate < FIXED_CURRENT_DATE) {
    return {
      success: false,
      message: 'The renewal date cannot be in the past.',
    };
  }

  const costInPaise = Math.round(cost * 100);

  const monthlyEquivalentInPaise =
    billingCycle === 'YEARLY'
      ? Math.round(costInPaise / 12)
      : costInPaise;

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        service_name TEXT NOT NULL,
        cost_paise INTEGER NOT NULL,
        billing_cycle TEXT NOT NULL
          CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
        monthly_equivalent_paise INTEGER NOT NULL,
        next_renewal_date TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      )
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date
      ON subscriptions(next_renewal_date)
    `).run();

    await env.DB.prepare(`
      INSERT INTO subscriptions (
        id,
        service_name,
        cost_paise,
        billing_cycle,
        monthly_equivalent_paise,
        next_renewal_date,
        is_active,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `)
      .bind(
        crypto.randomUUID(),
        serviceName,
        costInPaise,
        billingCycle,
        monthlyEquivalentInPaise,
        nextRenewalDate,
        new Date().toISOString(),
      )
      .run();

    return {
      success: true,
      message: `${serviceName} was added successfully.`,
    };
  } catch (error) {
    console.error('Failed to add subscription:', error);

    return {
      success: false,
      message: 'The subscription could not be saved. Please try again.',
    };
  }
}