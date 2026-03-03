import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { countryCodeToFlag, getBrowserIcon, getDeviceIcon } from '@/lib/formatters';

const AVATAR_EMOJIS = [
  '\u{1F60A}', '\u{1F60E}', '\u{1F913}', '\u{1F60D}', '\u{1F914}',
  '\u{1F929}', '\u{1F970}', '\u{1F642}', '\u{1F609}', '\u{1F60B}',
  '\u{1F917}', '\u{1F604}', '\u{1F973}', '\u{1F978}', '\u{1F920}',
  '\u{1FAE1}', '\u{1FAE0}', '\u{1FAE3}', '\u{1F60F}', '\u{1F636}',
];

function getAvatarEmoji(visitorId) {
  let hash = 0;
  for (let i = 0; i < visitorId.length; i++) {
    hash = ((hash << 5) - hash) + visitorId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

export default function RealtimeUsers() {
  const [data, setData] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const router = useRouter();
  const { siteId } = router.query;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!siteId) return;

    const fetchRealtime = async () => {
      try {
        const res = await fetch(`/api/analytics/${siteId}/realtime`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail on polling
      }
    };

    fetchRealtime();
    intervalRef.current = setInterval(fetchRealtime, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [siteId]);

  if (!data) return null;

  return (
    <div className="realtime-strip">
      <div className="realtime-indicator">
        <span className="realtime-dot" />
        <span className="realtime-count">{data.count}</span>
        <span className="realtime-label">
          {data.count === 1 ? 'visitor' : 'visitors'} online
        </span>
      </div>

      {data.users.length > 0 && (
        <div className="realtime-avatars">
          {data.users.slice(0, 20).map((user) => (
            <div
              key={user.visitor_id}
              className="realtime-avatar"
              onMouseEnter={() => setHoveredUser(user)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              {getAvatarEmoji(user.visitor_id)}

              {hoveredUser?.visitor_id === user.visitor_id && (
                <div className="realtime-tooltip">
                  <div className="realtime-tooltip-row">
                    {user.country ? `${countryCodeToFlag(user.country.toUpperCase())} ${user.country}` : 'Unknown location'}
                  </div>
                  <div className="realtime-tooltip-row">
                    {getBrowserIcon(user.browser)} {user.browser || 'Unknown browser'}
                  </div>
                  <div className="realtime-tooltip-row">
                    {getDeviceIcon(user.device_type)} {user.current_page || '/'}
                  </div>
                </div>
              )}
            </div>
          ))}
          {data.users.length > 20 && (
            <div className="realtime-avatar realtime-more">
              +{data.users.length - 20}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
