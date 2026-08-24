'use client';

import { useEffect, useState } from 'react';
import {
  getExpenseDashboard,
  type ExpenseDashboardData,
} from './dashboard-actions';

interface ExpenseDashboardProps {
  refreshKey: number;
}

export default function ExpenseDashboard({
  refreshKey,
}: ExpenseDashboardProps) {
  const [dashboard, setDashboard] =
    useState<ExpenseDashboardData | null>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError('');

        const result = await getExpenseDashboard();
        setDashboard(result);
      } catch (loadError) {
        console.error(
          'Failed to load expense dashboard:',
          loadError,
        );

        setError('Expense information could not be loaded.');
      }
    }

    void loadDashboard();
  }, [refreshKey]);

  if (error) {
    return (
      <p className="expense-dashboard-error" role="alert">
        {error}
      </p>
    );
  }

  if (!dashboard) {
    return (
      <p className="expense-dashboard-loading">
        Loading expense summary...
      </p>
    );
  }

  return (
    <section
      className="expense-dashboard"
      aria-labelledby="expense-dashboard-title"
    >
      <div className="expense-heading">
        <div>
          <p className="step-label">EXPENSE ANALYSIS</p>

          <h2 id="expense-dashboard-title">
            Spending overview
          </h2>

          <p>
            Pause a subscription to see your potential savings.
          </p>
        </div>
      </div>

      <div className="expense-metrics">
        <article className="expense-metric-card">
          <div className="expense-metric-icon">₹</div>

          <div>
            <p>Total monthly burn</p>
            <strong>{dashboard.totalMonthlyBurn}</strong>

            <span>
              {dashboard.activeSubscriptionCount} active{' '}
              {dashboard.activeSubscriptionCount === 1
                ? 'subscription'
                : 'subscriptions'}
            </span>
          </div>
        </article>

        <article className="expense-metric-card yearly">
          <div className="expense-metric-icon">12</div>

          <div>
            <p>Projected yearly expense</p>
            <strong>{dashboard.totalYearlyExpense}</strong>
            <span>Based on active subscriptions</span>
          </div>
        </article>
      </div>

      <article className="expense-table-panel">
        <div className="expense-table-heading">
          <div>
            <p className="step-label">BREAKDOWN</p>
            <h3>Subscription-wise expenditure</h3>
          </div>

          <span>{dashboard.rows.length} total</span>
        </div>

        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Subscription</th>
                <th>Billing cycle</th>
                <th>Original cost</th>
                <th>Monthly expense</th>
                <th>Yearly expense</th>
                <th>Next renewal</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.rows.map((row) => (
                <tr
                  className={
                    row.status === 'Paused'
                      ? 'paused-expense-row'
                      : ''
                  }
                  key={row.id}
                >
                  <td>
                    <span className="table-service-icon">
                      {row.serviceName
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <strong>{row.serviceName}</strong>
                  </td>

                  <td>
                    {row.billingCycle === 'MONTHLY'
                      ? 'Monthly'
                      : 'Yearly'}
                  </td>

                  <td>{row.originalCost}</td>
                  <td>{row.monthlyEquivalent}</td>
                  <td>{row.yearlyEquivalent}</td>
                  <td>{row.nextRenewalDate}</td>

                  <td>
                    <span
                      className={`expense-status ${
                        row.status === 'Active'
                          ? 'active'
                          : 'paused'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}