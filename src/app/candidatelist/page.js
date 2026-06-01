'use client';

import { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';

const RESULTS_PER_PAGE = 10;

export default function CandidateList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadCandidates() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(RESULTS_PER_PAGE),
          search: searchValue,
        });

        const response = await fetch(`/api/candidates?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load candidates.');
        }

        const data = await response.json();
        setCandidates(data.candidates || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Candidate list error:', err);
          setError('Error loading candidates. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();

    return () => controller.abort();
  }, [page, searchValue]);

  const totalPages = Math.max(1, Math.ceil(total / RESULTS_PER_PAGE));
  const startIndex = total === 0 ? 0 : (page - 1) * RESULTS_PER_PAGE + 1;
  const endIndex = Math.min(total, page * RESULTS_PER_PAGE);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearchValue(searchTerm.trim());
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <BackButton fallbackHref="/dashboard" forceFallback />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Candidate list</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Browse all candidates
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Search, filter and page through all candidates stored in the system.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative w-full sm:w-2/3">
                <span className="sr-only">Search candidates</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
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

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-700">
                    <th className="px-4 py-3">First Name</th>
                    <th className="px-4 py-3">Last Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                        Loading candidates...
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                        No candidates found.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-950">{candidate.first_name}</td>
                        <td className="px-4 py-4 text-slate-950">{candidate.last_name}</td>
                        <td className="px-4 py-4 text-slate-950">{candidate.email}</td>
                        <td className="px-4 py-4 text-slate-950">{candidate.phone}</td>
                        <td className="px-4 py-4 text-slate-950">
                          <div className="flex flex-wrap gap-3">
                            <a
                              href={`/candidateview/${candidate.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              View
                            </a>
                            <span className="text-slate-400">|</span>
                            <a
                              href={`/candidateonboarding?id=${candidate.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              Edit
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Showing {startIndex}-{endIndex} of {total} candidates
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`rounded-full px-4 py-2 text-sm transition ${pageNumber === page ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'}`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
