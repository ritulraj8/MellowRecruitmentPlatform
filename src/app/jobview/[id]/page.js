'use server';

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import BackButton from '../../../components/BackButton';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function JobViewPage({ params }) {
  const resolvedParams = await params;
  const jobId = Number(resolvedParams?.id);

  if (!jobId || Number.isNaN(jobId)) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <h1 className="text-2xl font-semibold text-slate-950">Invalid job</h1>
            <p className="mt-4 text-sm text-slate-600">Please check the link and try again.</p>
          </div>
        </section>
      </main>
    );
  }

  const result = await pool.query(
    'SELECT id, title, description, created_at FROM "JOBS" WHERE id = $1 LIMIT 1',
    [jobId]
  );

  const job = result.rows[0];

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <h1 className="text-2xl font-semibold text-slate-950">Job not found</h1>
            <p className="mt-4 text-sm text-slate-600">This job may have been removed.</p>
          </div>
        </section>
      </main>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <BackButton fallbackHref="/dashboard" forceFallback />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Job details</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {job.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">Posted on {formatDate(job.created_at)}</p>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-sm uppercase tracking-[0.24em] text-slate-500">Description</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
