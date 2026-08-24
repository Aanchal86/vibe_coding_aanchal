import {
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  serviceName: text('service_name').notNull(),
  costPaise: integer('cost_paise').notNull(),
  billingCycle: text('billing_cycle', {
    enum: ['MONTHLY', 'YEARLY'],
  }).notNull(),
  monthlyEquivalentPaise: integer(
    'monthly_equivalent_paise',
  ).notNull(),
  nextRenewalDate: text('next_renewal_date').notNull(),
  isActive: integer('is_active', {
    mode: 'boolean',
  })
    .notNull()
    .default(true),
  createdAt: text('created_at').notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;