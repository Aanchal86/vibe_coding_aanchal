'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  addSubscription,
  getSubscriptions,
} from './actions';

import { toggleSubscriptionStatus } from './status-actions';
import ExpenseDashboard from './ExpenseDashboard';
import RenewalBell from './RenewalBell';

import type {
  BillingCycle,
  SubscriptionView,
} from './types';

interface FormValues {
  serviceName: string;
  cost: string;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
}

const initialValues: FormValues = {
  serviceName: '',
  cost: '',
  billingCycle: 'MONTHLY',
  nextRenewalDate: '',
};

export default function Home() {
  const [values, setValues] =
    useState<FormValues>(initialValues);

  const [subscriptions, setSubscriptions] = useState<
    SubscriptionView[]
  >([]);

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [dashboardRefreshKey, setDashboardRefreshKey] =
    useState(0);

  const [
    updatingSubscriptionId,
    setUpdatingSubscriptionId,
  ] = useState<string | null>(null);

  const loadSubscriptions = useCallback(async () => {
    try {
      const savedSubscriptions = await getSubscriptions();

      setSubscriptions(savedSubscriptions);

      if (savedSubscriptions.length > 0) {
        setShowForm(false);
      }
    } catch (error) {
      console.error(
        'Failed to load subscriptions:',
        error,
      );

      setMessage('Could not load your subscriptions.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const result = await addSubscription(values);

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setValues(initialValues);

        await loadSubscriptions();

        setDashboardRefreshKey(
          (currentValue) => currentValue + 1,
        );

        setShowForm(false);
      }
    } catch (error) {
      console.error('Submission failed:', error);

      setMessage(
        'Something went wrong. Please try again.',
      );

      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusToggle(
    subscriptionId: string,
  ) {
    setUpdatingSubscriptionId(subscriptionId);
    setMessage('');
    setIsSuccess(false);

    try {
      const result =
        await toggleSubscriptionStatus(subscriptionId);

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        await loadSubscriptions();

        setDashboardRefreshKey(
          (currentValue) => currentValue + 1,
        );
      }
    } catch (error) {
      console.error('Status update failed:', error);

      setMessage(
        'Something went wrong while updating the subscription.',
      );

      setIsSuccess(false);
    } finally {
      setUpdatingSubscriptionId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="loading-page">
        <p>Loading subscriptions...</p>
      </main>
    );
  }

  if (!showForm && subscriptions.length > 0) {
    return (
      <main className="subscriptions-page">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="brand dashboard-brand">
              <span className="brand-mark">S</span>
              <span>SubTrack</span>
            </div>

            <RenewalBell
              subscriptions={subscriptions}
            />
          </div>

          <button
            className="add-another-button"
            type="button"
            onClick={() => {
              setMessage('');
              setIsSuccess(false);
              setShowForm(true);
            }}
          >
            + Add subscription
          </button>
        </header>

        <section className="subscriptions-heading">
          <div>
            <p className="step-label">YOUR SERVICES</p>

            <h1>Subscriptions</h1>

            <p>
              Review your recurring services and control
              which costs are included in your spending.
            </p>
          </div>

          <span className="subscription-count">
            {subscriptions.length}{' '}
            {subscriptions.length === 1
              ? 'subscription'
              : 'subscriptions'}
          </span>
        </section>

        <section
          className="subscription-grid"
          aria-label="Saved subscriptions"
        >
          {subscriptions.map((subscription) => {
            const isUpdating =
              updatingSubscriptionId === subscription.id;

            let statusText = 'Active';
            let statusClass = 'active';

            if (!subscription.isActive) {
              statusText = 'Paused';
              statusClass = 'paused';
            } else if (subscription.isRenewingSoon) {
              statusText = 'Renewing Soon';
              statusClass = 'renewing';
            }

            return (
              <article
                className={`subscription-card ${
                  !subscription.isActive
                    ? 'paused-card'
                    : ''
                }`}
                key={subscription.id}
              >
                <div className="card-top">
                  <span className="service-icon">
                    {subscription.serviceName
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span
                    className={`status-badge ${statusClass}`}
                  >
                    {statusText}
                  </span>
                </div>

                <h2>{subscription.serviceName}</h2>

                <p className="subscription-price">
                  {subscription.formattedCost}

                  <span>
                    /
                    {subscription.billingCycle ===
                    'MONTHLY'
                      ? 'month'
                      : 'year'}
                  </span>
                </p>

                {subscription.billingCycle ===
                  'YEARLY' && (
                  <p className="monthly-equivalent">
                    {
                      subscription.formattedMonthlyEquivalent
                    }{' '}
                    monthly equivalent
                  </p>
                )}

                <div className="renewal-information">
                  <span>Next renewal</span>

                  <strong>
                    {subscription.nextRenewalDate}
                  </strong>
                </div>

                <p
                  className={
                    subscription.isRenewingSoon &&
                    subscription.isActive
                      ? 'days-remaining urgent'
                      : 'days-remaining'
                  }
                >
                  {subscription.daysUntilRenewal === 0
                    ? 'Renews today'
                    : subscription.daysUntilRenewal === 1
                      ? '1 day remaining'
                      : `${subscription.daysUntilRenewal} days remaining`}
                </p>

                <div className="subscription-status-control">
                  <div>
                    <strong>
                      {subscription.isActive
                        ? 'Active'
                        : 'Paused'}
                    </strong>

                    <span>
                      {subscription.isActive
                        ? 'Included in your spending'
                        : 'Excluded from your spending'}
                    </span>
                  </div>

                  <button
                    className={`status-toggle ${
                      subscription.isActive
                        ? 'active'
                        : 'paused'
                    }`}
                    type="button"
                    role="switch"
                    aria-checked={subscription.isActive}
                    aria-label={`${
                      subscription.isActive
                        ? 'Pause'
                        : 'Activate'
                    } ${subscription.serviceName}`}
                    disabled={isUpdating}
                    onClick={() =>
                      void handleStatusToggle(
                        subscription.id,
                      )
                    }
                  >
                    <span />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {message && (
          <p
            className={`dashboard-message ${
              isSuccess ? 'success' : 'error'
            }`}
            role={isSuccess ? 'status' : 'alert'}
          >
            {message}
          </p>
        )}

        <ExpenseDashboard
          refreshKey={dashboardRefreshKey}
        />
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <section className="intro-section">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>SubTrack</span>
        </div>

        <div className="intro-content">
          <p className="eyebrow">
            PERSONAL FINANCE, SIMPLIFIED
          </p>

          <h1>
            Take control of your
            <span> recurring expenses.</span>
          </h1>

          <p className="intro-description">
            Track subscriptions, monitor renewal dates and
            understand exactly where your money goes every
            month.
          </p>

          <ul className="benefit-list">
            <li>
              <span>01</span>
              See your true monthly subscription cost
            </li>

            <li>
              <span>02</span>
              Get notified before upcoming renewals
            </li>

            <li>
              <span>03</span>
              Pause subscriptions to simulate savings
            </li>
          </ul>
        </div>

        <p className="intro-footer">
          Your subscription data stays organized in one place.
        </p>
      </section>

      <section className="form-section">
        <div className="form-container">
          <p className="step-label">GET STARTED</p>

          <h2>
            {subscriptions.length === 0
              ? 'Add your first subscription'
              : 'Add another subscription'}
          </h2>

          <p className="form-description">
            Enter the details of your recurring service.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="serviceName">
              Service name

              <input
                id="serviceName"
                name="serviceName"
                type="text"
                minLength={2}
                maxLength={60}
                placeholder="For example, Netflix"
                value={values.serviceName}
                onChange={(event) =>
                  setValues({
                    ...values,
                    serviceName: event.target.value,
                  })
                }
                disabled={isSubmitting}
                required
              />
            </label>

            <div className="field-row">
              <label htmlFor="cost">
                Cost

                <div className="currency-input">
                  <span>₹</span>

                  <input
                    id="cost"
                    name="cost"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="499"
                    value={values.cost}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        cost: event.target.value,
                      })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </label>

              <label htmlFor="billingCycle">
                Billing cycle

                <select
                  id="billingCycle"
                  name="billingCycle"
                  value={values.billingCycle}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      billingCycle:
                        event.target
                          .value as BillingCycle,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <option value="MONTHLY">
                    Monthly
                  </option>

                  <option value="YEARLY">
                    Yearly
                  </option>
                </select>
              </label>
            </div>

            <label htmlFor="nextRenewalDate">
              Next renewal date

              <input
                id="nextRenewalDate"
                name="nextRenewalDate"
                type="date"
                min="2026-08-24"
                value={values.nextRenewalDate}
                onChange={(event) =>
                  setValues({
                    ...values,
                    nextRenewalDate:
                      event.target.value,
                  })
                }
                disabled={isSubmitting}
                required
              />
            </label>

            <button
              className="submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving subscription...'
                : 'Add subscription'}

              {!isSubmitting && (
                <span aria-hidden="true">→</span>
              )}
            </button>

            {message && (
              <p
                className={`form-message ${
                  isSuccess ? 'success' : 'error'
                }`}
                role={
                  isSuccess ? 'status' : 'alert'
                }
              >
                {message}
              </p>
            )}

            {subscriptions.length > 0 && (
              <button
                className="cancel-button"
                type="button"
                onClick={() => {
                  setMessage('');
                  setShowForm(false);
                }}
                disabled={isSubmitting}
              >
                Return to subscriptions
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}