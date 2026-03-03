import { countryCodeToFlag, getBrowserIcon, getOsIcon, getDeviceIcon } from '@/lib/formatters';

const JOURNEY_COLORS = [
  '#e8604c', '#4c9fe8', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function getJourneyColor(pathname) {
  let hash = 0;
  for (let i = 0; i < pathname.length; i++) {
    hash = ((hash << 5) - hash) + pathname.charCodeAt(i);
    hash |= 0;
  }
  return JOURNEY_COLORS[Math.abs(hash) % JOURNEY_COLORS.length];
}

function formatTimeToComplete(seconds) {
  if (!seconds || seconds <= 0) return 'Instant';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h} hours` : `${h} hours`;
  }
  const d = Math.floor(seconds / 86400);
  return `${d} days`;
}

function formatAmount(amount, currency) {
  const value = (amount || 0) / 100;
  if (currency === 'usd' || !currency) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `${value.toFixed(2)} ${(currency || '').toUpperCase()}`;
}

function getSourceFavicon(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
}

function formatTimestamp(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const AVATAR_EMOJIS = [
  '\u{1F60A}', '\u{1F60E}', '\u{1F913}', '\u{1F60D}', '\u{1F914}',
  '\u{1F929}', '\u{1F970}', '\u{1F642}', '\u{1F609}', '\u{1F60B}',
  '\u{1F917}', '\u{1F604}', '\u{1F973}', '\u{1F978}', '\u{1F920}',
  '\u{1FAE1}', '\u{1FAE0}', '\u{1FAE3}', '\u{1F60F}', '\u{1F636}',
];

function getAvatarEmoji(visitorId) {
  let hash = 0;
  for (let i = 0; i < (visitorId || '').length; i++) {
    hash = ((hash << 5) - hash) + visitorId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

function maskName(email) {
  if (!email) return null;
  const [local] = email.split('@');
  if (local.length <= 3) return local.slice(0, 1) + '** ******';
  return local.slice(0, 3) + '** ******';
}

export default function ConversionJourneyTable({ conversions }) {
  if (!conversions || conversions.length === 0) {
    return (
      <div className="empty-state">
        <p>No conversions for this period</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="journey-table journey-table-detailed">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Source</th>
            <th>Spent</th>
            <th>Time to complete</th>
            <th>Completed at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((conv) => {
            const source = conv.utm_source || conv.referrer_domain || 'Direct';
            const sourceDomain = conv.referrer_domain;
            const displayName = maskName(conv.stripe_customer_email) || `Visitor ${(conv.visitor_id || '').slice(-6)}`;

            return (
              <tr key={conv.id}>
                <td>
                  <div className="visitor-cell">
                    <div className="visitor-avatar-lg">
                      {getAvatarEmoji(conv.visitor_id)}
                    </div>
                    <div className="visitor-info">
                      <div className="visitor-name">
                        {displayName}
                        <span className="badge-customer">Customer</span>
                      </div>
                      <div className="visitor-meta">
                        {conv.country && (
                          <span>{countryCodeToFlag(conv.country.toUpperCase())} {conv.country}</span>
                        )}
                        {conv.device_type && (
                          <span>{getDeviceIcon(conv.device_type)} {conv.device_type}</span>
                        )}
                        {conv.os && (
                          <span>{getOsIcon(conv.os)} {conv.os}</span>
                        )}
                        {conv.browser && (
                          <span>{getBrowserIcon(conv.browser)} {conv.browser}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="source-cell">
                    {sourceDomain && (
                      <img
                        src={getSourceFavicon(sourceDomain)}
                        alt=""
                        width={16}
                        height={16}
                        className="source-favicon"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span>{source}</span>
                  </div>
                </td>

                <td>
                  <span className="amount-value">
                    {formatAmount(conv.amount, conv.currency)}
                  </span>
                </td>

                <td>{formatTimeToComplete(conv.timeToComplete)}</td>

                <td>{formatTimestamp(conv.created_at)}</td>

                <td>
                  <div className="journey-dots">
                    {(conv.journey || []).map((step, i) => (
                      <div
                        key={i}
                        className="journey-dot"
                        style={{ backgroundColor: getJourneyColor(step.pathname) }}
                        title={step.pathname}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
