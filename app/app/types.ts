export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface SubscriptionView {
  id: string;
  serviceName: string;
  billingCycle: BillingCycle;
  formattedCost: string;
  formattedMonthlyEquivalent: string;
  nextRenewalDate: string;
  daysUntilRenewal: number;
  isRenewingSoon: boolean;
  isActive: boolean;
}