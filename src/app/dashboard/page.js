
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';

export default function Dashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [candidateCount, setCandidateCount] = useState(null);
  const [jobCount, setJobCount] = useState(null);
  const [jobsLast30Days, setJobsLast30Days] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = window.localStorage.getItem('mellowAuth') === 'true';

    if (!isLoggedIn) {
      router.replace('/loginpage');
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (checkingAuth) {
      return;
    }

    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch('/api/dashboard-stats', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load dashboard stats');
        }

        const data = await response.json();
        setCandidateCount(data.totalCandidates ?? 0);
        setJobCount(data.totalJobs ?? 0);
        setJobsLast30Days(data.totalJobsLast30Days ?? 0);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        setCandidateCount(0);
        setJobCount(0);
        setJobsLast30Days(0);
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();

    return () => controller.abort();
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center px-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-700">Checking authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <BackButton fallbackHref="/loginpage" forceFallback />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Dashboard overview</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Hiring metrics at a glance
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              See your candidate and job activity, and jump to the tools you use most to keep hiring moving.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Total candidates</p>
              <p className="mt-5 text-4xl font-semibold text-slate-950">
                {statsLoading ? '--' : candidateCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">All active candidates in your talent pool.</p>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Total job postings</p>
              <p className="mt-5 text-4xl font-semibold text-slate-950">
                {statsLoading ? '--' : jobCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Open roles currently being managed in Mellow.</p>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Candidates onboarded</p>
              <p className="mt-5 text-4xl font-semibold text-slate-950"></p>
              <p className="mt-3 text-sm leading-6 text-slate-600">New hires successfully onboarded in the last 30 days.</p>
            </article>

 
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Jobs posted</p>
              <p className="mt-5 text-4xl font-semibold text-slate-950">
                {statsLoading ? '--' : jobsLast30Days}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Roles published in the past 30 days.</p>
            </article>
          </div>

          <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">Navigate hiring tools</h2>
              </div>

              <a href="/candidateonboarding" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Candidate Onboarding</p>
                <p className="mt-2 text-sm text-slate-600">Start onboarding new talent with your workflow.</p>
              </a>

              <a href="/candidatelist" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Candidate List</p>
                <p className="mt-2 text-sm text-slate-600">Browse and manage your talent pool.</p>
              </a>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <a href="/jobposting" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Job Posting</p>
                <p className="mt-2 text-sm text-slate-600">Create and publish new job openings.</p>
              </a>

              <a href="/joblisting" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Job Listing</p>
                <p className="mt-2 text-sm text-slate-600">Review all active job postings.</p>
              </a>

              <a href="/jobmatching" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Job Matching</p>
                <p className="mt-2 text-sm text-slate-600">Match candidates to roles instantly.</p>
              </a>

              <a href="/candidateselection" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 transition hover:border-cyan-400 hover:bg-cyan-50">
                <p className="text-sm font-semibold">Candidate Selection</p>
                <p className="mt-2 text-sm text-slate-600">Choose finalists and move toward hire decisions.</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
