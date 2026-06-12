'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '../../components/BackButton';

const RESULTS_PER_PAGE = 10;

export default function CandidateList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
          sortBy,
          sortOrder,
        });

        const response = await fetch(`/api/candidates?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load candidates.');
        }

        const data = await response.json();
        const candidatesData = data.candidates || [];
        setCandidates(candidatesData);
        setTotal(data.total || 0);
        
        if (candidatesData.length === 0 && page > 1) {
          setPage(prev => Math.max(1, prev - 1));
        }
        
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Candidate list error:', err);
          setError('Error loading candidates. Please try again.');
          setLoading(false);
        }
      }
    }

    loadCandidates();

    return () => controller.abort();
  }, [page, searchValue, sortBy, sortOrder, refreshTrigger]);

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

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function openDeleteModal(candidate) {
    setCandidateToDelete(candidate);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!candidateToDelete) return;
    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/candidate/${candidateToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete candidate.');
      }

      setRefreshTrigger((prev) => prev + 1);
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    } catch (err) {
      console.error('Delete candidate error:', err);
      setError(err.message || 'Error deleting candidate. Please try again.');
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const renderSortIcon = (field) => {
    const isActive = sortBy === field;
    if (!isActive) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    if (sortOrder === 'asc') {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {/* Sort Ascending Icon: text lines + arrow up */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h10M3 10h7M3 16h7M18 5v14M15 8l3-3 3 3" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {/* Sort Descending Icon: text lines + arrow down */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h10M3 10h7M3 16h7M18 5v14M15 16l3 3 3-3" />
      </svg>
    );
  };

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
                    <th className="px-4 py-3 select-none text-slate-700 font-semibold text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span>First Name</span>
                        <button
                          onClick={() => handleSort('first_name')}
                          className={`p-1.5 rounded-lg transition-all duration-150 focus:outline-none ${
                            sortBy === 'first_name'
                              ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                              : 'text-slate-400 hover:bg-cyan-50 hover:text-cyan-600'
                          }`}
                          title="Sort by First Name"
                        >
                          {renderSortIcon('first_name')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 select-none text-slate-700 font-semibold text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span>Last Name</span>
                        <button
                          onClick={() => handleSort('last_name')}
                          className={`p-1.5 rounded-lg transition-all duration-150 focus:outline-none ${
                            sortBy === 'last_name'
                              ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                              : 'text-slate-400 hover:bg-cyan-50 hover:text-cyan-600'
                          }`}
                          title="Sort by Last Name"
                        >
                          {renderSortIcon('last_name')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 select-none text-slate-700 font-semibold text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span>Email</span>
                        <button
                          onClick={() => handleSort('email')}
                          className={`p-1.5 rounded-lg transition-all duration-150 focus:outline-none ${
                            sortBy === 'email'
                              ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                              : 'text-slate-400 hover:bg-cyan-50 hover:text-cyan-600'
                          }`}
                          title="Sort by Email"
                        >
                          {renderSortIcon('email')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 select-none text-slate-700 font-semibold text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span>Phone</span>
                        <button
                          onClick={() => handleSort('phone')}
                          className={`p-1.5 rounded-lg transition-all duration-150 focus:outline-none ${
                            sortBy === 'phone'
                              ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                              : 'text-slate-400 hover:bg-cyan-50 hover:text-cyan-600'
                          }`}
                          title="Sort by Phone"
                        >
                          {renderSortIcon('phone')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                        <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                        <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                        <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                        <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div></td>
                      </tr>
                    ))
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
                          <div className="flex flex-wrap gap-3 items-center">
                            <Link
                              href={`/candidateview/${candidate.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              View
                            </Link>
                            <span className="text-slate-400">|</span>
                            <Link
                              href={`/candidateonboarding?id=${candidate.id}`}
                              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                            >
                              Edit
                            </Link>
                            <span className="text-slate-400">|</span>
                            <button
                              onClick={() => openDeleteModal(candidate)}
                              className="text-sm font-semibold text-red-600 hover:text-red-800 focus:outline-none cursor-pointer"
                            >
                              Delete
                            </button>
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

      {deleteModalOpen && candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-slate-950">Confirm Deletion</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete candidate <strong className="font-semibold text-slate-900">{candidateToDelete.first_name} {candidateToDelete.last_name}</strong>? This action cannot be undone and will delete all related records.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCandidateToDelete(null);
                }}
                disabled={deleting}
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
