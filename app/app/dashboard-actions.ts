'use server';

import { env } from 'cloudflare:workers';

type BillingCycle = 'MONTHLY' | 'YEARLY';

interface SubscriptionRow {
  id: string;
  service_name: string;
  cost_paise: number;
  billing_cycle: BillingCycle;
  monthly_equivalent_paise: number;
  next_renewal_date: string;
  is_active: number;
}

export interface ExpenseRow {
  id: string;
  serviceName: string;
  billingCycle: BillingCycle;
  originalCost: string;
  monthlyEquivalent: string;
  yearlyEquivalent: string;
  nextRenewalDate: string;
  status: 'Active' | 'Paused';
}

export interface ExpenseDashboardData {
  totalMonthlyBurn: string;
  totalYearlyExpense: string;
  activeSubscriptionCount: number;
  rows: ExpenseRow[];
}

function formatCurrency(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export async function getExpenseDashboard():
  Promise<ExpenseDashboardData> {
  const result = await env.DB.prepare(`
    SELECT
      id,
      service_name,
      cost_paise,
      billing_cycle,
      monthly_equivalent_paise,
      next_renewal_date,
      is_active
    FROM subscriptions
    ORDER BY service_name ASC
  `).all<SubscriptionRow>();

  const subscriptions = result.results ?? [];

  let totalMonthlyBurnPaise = 0;
  let totalYearlyExpensePaise = 0;
  let activeSubscriptionCount = 0;

  const rows = subscriptions.map((subscription) => {
    const yearlyEquivalentPaise =
      subscription.billing_cycle === 'YEARLY'
        ? subscription.cost_paise
        : subscription.cost_paise * 12;

    if (subscription.is_active === 1) {
      totalMonthlyBurnPaise +=
        subscription.monthly_equivalent_paise;

      totalYearlyExpensePaise += yearlyEquivalentPaise;
      activeSubscriptionCount += 1;
    }

    return {
      id: subscription.id,
      serviceName: subscription.service_name,
      billingCycle: subscription.billing_cycle,
      originalCost: formatCurrency(
        subscription.cost_paise,
      ),
      monthlyEquivalent: formatCurrency(
        subscription.monthly_equivalent_paise,
      ),
      yearlyEquivalent: formatCurrency(
        yearlyEquivalentPaise,
      ),
      nextRenewalDate: subscription.next_renewal_date,
      status:
        subscription.is_active === 1
          ? ('Active' as const)
          : ('Paused' as const),
    };
  });

  return {
    totalMonthlyBurn: formatCurrency(
      totalMonthlyBurnPaise,
    ),
    totalYearlyExpense: formatCurrency(
      totalYearlyExpensePaise,
    ),
    activeSubscriptionCount,
    rows,
  };
}