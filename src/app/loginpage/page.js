'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid username or password');
        setLoading(false);
        return;
      }

      localStorage.setItem('mellowAuth', 'true');
      localStorage.setItem('mellowLastActive', String(Date.now()));
      router.replace('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10 lg:px-20">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/50">
          <BackButton fallbackHref="/dashboard" />
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">
              Welcome back to
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Mellow Login
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Sign in to continue managing your talent pipeline,
              interview workflow, and hiring decisions with confidence.
            </p>
          </div>

          <form onSubmit={handleLogin} method="POST" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing In...
                </div>
              ) : (
                'Sign in to Mellow'
              )}
            </button>
          </form>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
            <p className="mt-2">
              Create your recruitment workspace in seconds and start
              building hiring experiences that feel effortless.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

