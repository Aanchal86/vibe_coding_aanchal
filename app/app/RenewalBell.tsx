'use client';

import { useState } from 'react';
import type { SubscriptionView } from './types';

interface RenewalBellProps {
  subscriptions: SubscriptionView[];
}

export default function RenewalBell({
  subscriptions,
}: RenewalBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const upcomingRenewals = subscriptions.filter(
    (subscription) =>
      subscription.isActive &&
      subscription.isRenewingSoon,
  );

  const alertCount = upcomingRenewals.length;

  return (
    <div className="renewal-bell-container">
      <button
        className="renewal-bell-button"
        type="button"
        aria-label={`${alertCount} upcoming renewals`}
        aria-expanded={isOpen}
        aria-controls="renewal-notifications"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="bell-symbol" aria-hidden="true">
          ♢
        </span>

        {alertCount > 0 && (
          <span className="notification-count">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="renewal-notifications"
          className="notification-panel"
          aria-label="Upcoming renewal notifications"
        >
          <div className="notification-heading">
            <div>
              <p className="step-label">REMINDERS</p>
              <h2>Upcoming renewals</h2>
            </div>

            <button
              className="close-notifications"
              type="button"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {upcomingRenewals.length === 0 ? (
            <div className="empty-notifications">
              <span aria-hidden="true">✓</span>
              <h3>You are all caught up</h3>
              <p>No active subscriptions renew in the next 7 days.</p>
            </div>
          ) : (
            <div className="notification-list">
              {upcomingRenewals.map((subscription) => (
                <article
                  className="notification-item"
                  key={subscription.id}
                >
                  <span className="notification-service-icon">
                    {subscription.serviceName
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div className="notification-details">
                    <div>
                      <h3>{subscription.serviceName}</h3>
                      <span>{subscription.formattedCost}</span>
                    </div>

                    <p>
                      {subscription.daysUntilRenewal === 0
                        ? 'Renews today'
                        : subscription.daysUntilRenewal === 1
                          ? 'Renews tomorrow'
                          : `Renews in ${subscription.daysUntilRenewal} days`}
                    </p>

                    <time
                      dateTime={subscription.nextRenewalDate}
                    >
                      {subscription.nextRenewalDate}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}

          <footer className="notification-footer">
            Showing renewals due within 7 days
          </footer>
        </section>
      )}
    </div>
  );
}