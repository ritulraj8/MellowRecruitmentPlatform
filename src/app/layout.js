import './globals.css';

export const metadata = {
  title: 'Mellow',
  description: 'Welcome to Mellow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
