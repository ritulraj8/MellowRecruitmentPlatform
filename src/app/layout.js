import './globals.css';
import InactivityTracker from '@/components/InactivityTracker';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Mellow',
  description: 'Welcome to Mellow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <InactivityTracker />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
