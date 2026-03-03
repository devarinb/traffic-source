import '@/styles/globals.scss';
import { AuthProvider } from '@/contexts/AuthContext';
import { DateRangeProvider } from '@/contexts/DateRangeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DateRangeProvider>
          <Component {...pageProps} />
        </DateRangeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
