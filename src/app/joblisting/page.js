'use client';

import { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (searchValue) {
          params.append('search', searchValue);
        }

        const response = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load job listings.');
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Unable to load jobs. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
    return () => controller.abort();
  }, [searchValue]);

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getPreview(description) {
    if (!description) return '';
    const text = description.trim();
    return text.length > 100 ? `${text.slice(0, 100)}...` : text;
  }

  function handleSearch(event) {
    event.preventDefault();
    setSearchValue(searchTerm.trim());
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <BackButton fallbackHref="/dashboard" forceFallback />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Job listing</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Open job postings
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Search by title, review the latest openings, and start matching candidates.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search jobs</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job title"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Search
              </button>
            </form>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                Loading job postings...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                No jobs match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="px-4 py-3">Job Title</th>
                      <th className="px-4 py-3">Description Preview</th>
                      <th className="px-4 py-3">Posted On</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-semibold text-slate-950">{job.title}</td>
                        <td className="px-4 py-4 text-slate-700">{getPreview(job.description)}</td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(job.created_at)}</td>
                        <td className="px-4 py-4 text-slate-950">
                          <div className="flex flex-wrap gap-3">
                            <a
                              href={`/jobview/${job.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              View
                            </a>
                            <span className="text-slate-400">|</span>
                            <a
                              href={`/job-matching?jobId=${job.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              Match
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
