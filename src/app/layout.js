import './globals.css';
import InactivityTracker from '@/components/InactivityTracker';

export const metadata = {
  title: 'Mellow',
  description: 'Welcome to Mellow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <InactivityTracker />
        {children}
      </body>
    </html>
  );
}
