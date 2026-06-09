import './globals.css';
import InactivityTracker from '@/components/InactivityTracker';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Mellow',
  description: 'Welcome to Mellow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <InactivityTracker />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
