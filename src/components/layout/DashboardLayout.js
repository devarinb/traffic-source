import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useTheme } from '@/contexts/ThemeContext';

const periods = [
  { value: '24h', label: '1D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '1M' },
  { value: '90d', label: '3M' },
  { value: '12m', label: '1Y' },
];

export default function DashboardLayout({ children, siteId, siteName, siteDomain }) {
  const { period, setPeriod, setCustomRange } = useDateRange();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const path = router.asPath;

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <header className="app-header">
          <div className="app-header-left">
            <Link href="/sites" className="app-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M22 12A10 10 0 1 1 12 2m2.5.315c3.514.904 6.28 3.67 7.185 7.185" />
              </svg>
              Traffic Source
            </Link>
            <nav className="app-nav">
              <Link href="/sites" className={`app-nav-link ${path === '/sites' ? 'active' : ''}`}>
                Sites
              </Link>
              {siteId && (
                <>
                  <Link
                    href={`/analytics/${siteId}`}
                    className={`app-nav-link ${path === `/analytics/${siteId}` ? 'active' : ''}`}
                  >
                    Analytics
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/conversions`}
                    className={`app-nav-link ${path.includes('/conversions') ? 'active' : ''}`}
                  >
                    Conversions
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/settings`}
                    className={`app-nav-link ${path.includes('/settings') && path.includes('/analytics/') ? 'active' : ''}`}
                  >
                    Settings
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="app-header-right">
            <button className="btn-ghost theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button className="btn-ghost" onClick={logout}>Sign out</button>
          </div>
        </header>

        <main className="app-content">
          {(siteName || siteDomain) && (
            <div className="page-header">
              <div className="page-header-site">
                {siteDomain && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(siteDomain)}&sz=32`}
                    alt=""
                    width={24}
                    height={24}
                    className="page-header-favicon"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div>
                  <h1 className="page-header-name">{siteName || siteDomain}</h1>
                  {siteName && siteDomain && (
                    <span className="page-header-domain">{siteDomain}</span>
                  )}
                </div>
              </div>
              <div className="date-picker">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    className={period === p.value ? 'active' : ''}
                    onClick={() => { setCustomRange(null); setPeriod(p.value); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
