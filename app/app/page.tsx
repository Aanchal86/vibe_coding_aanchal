'use client';

import { FormEvent, useState } from 'react';
import { addSubscription } from './actions';

type BillingCycle = 'MONTHLY' | 'YEARLY';

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
  const [values, setValues] = useState<FormValues>(initialValues);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setMessage('Something went wrong. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="onboarding-page">
      <section className="intro-section">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>SubTrack</span>
        </div>

        <div className="intro-content">
          <p className="eyebrow">PERSONAL FINANCE, SIMPLIFIED</p>

          <h1>
            Take control of your
            <span> recurring expenses.</span>
          </h1>

          <p className="intro-description">
            Track subscriptions, monitor renewal dates and understand exactly
            where your money goes every month.
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
          <h2>Add your first subscription</h2>

          <p className="form-description">
            Enter one recurring service to begin building your dashboard.
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
                      billingCycle: event.target.value as BillingCycle,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
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
                    nextRenewalDate: event.target.value,
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

              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>

            {message && (
              <p
                className={`form-message ${
                  isSuccess ? 'success' : 'error'
                }`}
                role={isSuccess ? 'status' : 'alert'}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}