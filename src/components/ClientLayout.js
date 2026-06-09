'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  // Exclude landing page (/) and login page (/loginpage)
  const showNavbar = pathname !== '/' && pathname !== '/loginpage';

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
