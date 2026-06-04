'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function InactivityTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const lastRefreshRef = useRef(Date.now());

  useEffect(() => {
    // List of protected routes that require authentication
    const protectedPaths = [
      '/candidatelist',
      '/candidateonboarding',
      '/candidateselection',
      '/candidateview',
      '/dashboard',
      '/joblisting',
      '/jobmatching',
      '/jobposting',
      '/jobview',
    ];

    // Determine if the current page is a protected page
    const isProtected = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (!isProtected) return;

    // Check if the user is flagged as logged in on client-side
    const isLoggedIn = localStorage.getItem('mellowAuth') === 'true';
    if (!isLoggedIn) return;

    // Initialize/update last active time in localStorage
    localStorage.setItem('mellowLastActive', String(Date.now()));

    const handleActivity = async () => {
      const now = Date.now();
      localStorage.setItem('mellowLastActive', String(now));

      // Throttle the backend session refresh to at most once every 5 minutes
      if (now - lastRefreshRef.current > 5 * 60 * 1000) {
        lastRefreshRef.current = now;
        try {
          const res = await fetch('/api/refresh', { method: 'POST' });
          if (res.status === 401) {
            // If the server tells us the session is invalid, log out
            await handleLogout();
          }
        } catch (err) {
          console.error('Failed to refresh session:', err);
        }
      }
    };

    const handleLogout = async () => {
      // Clear client-side authentication states
      localStorage.removeItem('mellowAuth');
      localStorage.removeItem('mellowLastActive');
      
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout error:', err);
      }
      
      // Redirect to the login page
      router.push('/loginpage');
    };

    // Events that indicate user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Run a periodic check every 5 seconds to inspect inactivity duration
    const checkInterval = setInterval(() => {
      const lastActive = Number(localStorage.getItem('mellowLastActive') || 0);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in ms

      if (now - lastActive > thirtyMinutes) {
        clearInterval(checkInterval);
        handleLogout();
      }
    }, 5000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [pathname, router]);

  return null;
}
