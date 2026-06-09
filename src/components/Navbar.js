'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'candidates' | 'jobs' | null
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('mellowAuth');
    localStorage.removeItem('mellowLastActive');
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.replace('/loginpage');
  };

  const isRouteActive = (route) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(route);
  };

  const candidatesLinks = [
    { name: 'Browse Pool', href: '/candidatelist' },
    { name: 'Onboard Candidate', href: '/candidateonboarding' },
    { name: 'Selection Pipeline', href: '/candidateselection' },
  ];

  const jobsLinks = [
    { name: 'Open Postings', href: '/joblisting' },
    { name: 'Post a Job', href: '/jobposting' },
    { name: 'Job Matching', href: '/jobmatching' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16" ref={dropdownRef}>
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/icon.png"
                alt="Mellow Logo"
                className="h-9 w-9 rounded-xl object-contain shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors duration-300">
                Mellow
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isRouteActive('/dashboard')
                  ? 'bg-cyan-50 text-cyan-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Dashboard
            </Link>

            {/* Candidates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'candidates' ? null : 'candidates')}
                onMouseEnter={() => setActiveDropdown('candidates')}
                className={`flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isRouteActive('/candidatelist') || isRouteActive('/candidateonboarding') || isRouteActive('/candidateselection') || isRouteActive('/candidateview')
                    ? 'bg-cyan-50 text-cyan-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Candidates
                <svg
                  className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === 'candidates' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'candidates' && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-3 duration-200"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {candidatesLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                        pathname === link.href
                          ? 'bg-cyan-50/50 text-cyan-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Jobs Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'jobs' ? null : 'jobs')}
                onMouseEnter={() => setActiveDropdown('jobs')}
                className={`flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isRouteActive('/joblisting') || isRouteActive('/jobposting') || isRouteActive('/jobmatching') || isRouteActive('/jobview')
                    ? 'bg-cyan-50 text-cyan-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Jobs
                <svg
                  className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === 'jobs' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'jobs' && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-3 duration-200"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {jobsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                        pathname === link.href
                          ? 'bg-cyan-50/50 text-cyan-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logout & Profile Section */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              <svg
                className="mr-2 h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-6 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isRouteActive('/dashboard') ? 'bg-cyan-50 text-cyan-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Dashboard
            </Link>

            {/* Candidates Group */}
            <div className="py-2">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Candidates
              </p>
              <div className="mt-1.5 space-y-1">
                {candidatesLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-cyan-50 text-cyan-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Jobs Group */}
            <div className="py-2">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Jobs
              </p>
              <div className="mt-1.5 space-y-1">
                {jobsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-cyan-50 text-cyan-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              <svg
                className="mr-2 h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
