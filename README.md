# SubTrack — Subscription Tracker & Renewal Dashboard

SubTrack is a personal finance dashboard for tracking recurring SaaS and streaming subscriptions. It normalizes monthly and yearly billing costs, monitors renewal dates and allows users to simulate savings by pausing subscriptions.

## Features implemented

### Subscription onboarding

Users can add a subscription with:

- Service name
- Cost in Indian Rupees
- Monthly or yearly billing cycle
- Next renewal date

The backend validates all submitted values before saving them.

### Persistent subscription storage

Subscriptions are stored in a Cloudflare D1 SQLite database and remain available after refreshing the application.

Currency values are converted to paise before storage to avoid floating-point calculation errors.

### Cost normalization

All cost calculations are performed on the server.

- Monthly subscriptions retain their entered monthly cost.
- Yearly subscriptions are divided by 12 to calculate their monthly equivalent.
- Monthly subscriptions are multiplied by 12 to calculate their yearly projection.

### Subscription cards

Each saved subscription is displayed as a card containing:

- Service name
- Original cost
- Billing cycle
- Monthly equivalent for yearly plans
- Next renewal date
- Days remaining
- Current Active or Paused status

### Renewal notification center

The notification bell displays active subscriptions renewing within seven days of the fixed assessment date.

Subscriptions due within zero to seven days, inclusive, are marked **Renewing Soon**.

### Expense dashboard

The dashboard provides:

- Total active monthly burn rate
- Projected active yearly expense
- Number of active subscriptions
- Subscription-wise expense breakdown table

The expense table displays original, monthly and yearly costs for each subscription.

### Active and Paused simulation

Users can pause a subscription without deleting it.

When a subscription is paused:

- Its card becomes visually greyed out.
- Its cost is excluded from monthly and yearly totals.
- It is excluded from upcoming-renewal notifications.
- Its database record remains stored.
- It can be activated again using the same toggle.

## Business rules

- All validation and financial calculations are performed on the server.
- Currency is stored as integer paise.
- Yearly monthly equivalent = yearly cost ÷ 12.
- Monthly yearly equivalent = monthly cost × 12.
- A renewal is urgent when it is between 0 and 7 days away.
- Past renewal dates are rejected.
- Paused subscriptions do not contribute to active expense metrics.
- Paused subscriptions do not appear in renewal alerts.

## Fixed assessment date

The application currently uses the following fixed date for renewal calculations:

```text
2026-08-24