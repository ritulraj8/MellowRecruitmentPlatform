'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '../../components/BackButton';
import Pagination from '../../components/Pagination';

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

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
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load job listings.');
        }
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Unable to load jobs. Please try again.');
          setLoading(false);
        }
      }
    }

    loadJobs();
    return () => controller.abort();
  }, [searchValue, page]);

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
    setPage(1);
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

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            ) : !loading && jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                No jobs match your search.
              </div>
            ) : (
              <>
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
                      {loading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                            <td className="px-4 py-4"><div className="h-4 w-80 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                            <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                            <td className="px-4 py-4">
                              <div className="flex gap-3">
                                <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800"></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4 font-semibold text-slate-950">{job.title}</td>
                            <td className="px-4 py-4 text-slate-700">{getPreview(job.description)}</td>
                            <td className="px-4 py-4 text-slate-700">{formatDate(job.created_at)}</td>
                            <td className="px-4 py-4 text-slate-950">
                              <div className="flex flex-wrap gap-3">
                                <Link
                                  href={`/jobview/${job.id}`}
                                  className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                                >
                                  View
                                </Link>
                                <span className="text-slate-400">|</span>
                                <Link
                                  href={`/jobmatching?jobId=${job.id}`}
                                  className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                                >
                                  Match
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!loading && (
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / limit)}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
