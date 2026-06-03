'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';

const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

export default function JobMatchingPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadJobs() {
      setLoadingJobs(true);
      setError('');

      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Unable to load jobs.');
        }
        const data = await response.json();
        if (active) {
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Job matching load error:', err);
        if (active) {
          setError('Failed to load jobs. Please refresh.');
        }
      } finally {
        if (active) {
          setLoadingJobs(false);
        }
      }
    }

    loadJobs();
    return () => {
      active = false;
    };
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => String(job.id) === String(selectedJobId)) || null,
    [jobs, selectedJobId]
  );

  async function handleFindMatches() {
    setError('');
    if (!selectedJob) {
      setError('Please select a job before finding matches.');
      return;
    }

    setLoadingMatches(true);
    setMatches([]);

    try {
      const response = await fetch('/api/candidates?limit=50');
      if (!response.ok) {
        throw new Error('Unable to load candidate data.');
      }

      const data = await response.json();
      const candidates = data.candidates || [];

      const scoredCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            // Prepare data for Flask
            console.log("Candidate ID:", candidate.id);
            //onsole.log("Resume Data:", candidate.resume_path);
            const embeddingResponse = await fetch(
              '/api/embedding',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  candidateId: candidate.id,
                  jobId: selectedJob.id,
                  resumeBlob: candidate.resume_path,
                  jobDescription: selectedJob.description,
                }),
              }
            );

            const embeddingData =
              await embeddingResponse.json();

            if (!embeddingResponse.ok) {
              throw new Error(
                embeddingData.message ||
                'Failed to load embeddings'
              );
            }

            const matchPayload = {
              candidate_id: candidate.id,
              job_id: selectedJob.id,
              job_description: selectedJob.description,
              resume_blob: candidate.resume_path || '',
              job_embedding:
                embeddingData.job_embedding,
              resume_embedding:
                embeddingData.resume_embedding,
            };

            const matchResponse = await fetch(`${FLASK_API_URL}/match`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(matchPayload),
            });

            if (!matchResponse.ok) {
              const errorData = await matchResponse.json().catch(() => ({}));
              console.warn(`Match score failed for candidate ${candidate.id}:`, errorData.error || matchResponse.statusText);
              return { ...candidate, score: 0 };
            }

            const matchData = await matchResponse.json();
            return {
              ...candidate,
              score: matchData.scores?.hybrid_percentage ?? 0,
            };
          } catch (err) {
            console.warn(`Error scoring candidate ${candidate.id}:`, err);
            return { ...candidate, score: 0 };
          }
        })
      );

      const ranked = scoredCandidates
        .sort((a, b) => b.score - a.score)
        .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

      setMatches(ranked);
    } catch (err) {
      console.error('Match error:', err);
      setError('Failed to find matching candidates. Ensure Flask server is running at ' + FLASK_API_URL);
    } finally {
      setLoadingMatches(false);
    }
  }

  function handleViewCandidate(candidateId) {
    router.push(`/candidateview/${candidateId}`);
  }

  function handleSelectCandidate(candidateId) {
    // Navigate to candidate selection or next step
    router.push(`/candidateselection?candidateId=${candidateId}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <BackButton fallbackHref="/dashboard" forceFallback />

          {/* Header Card */}
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Job matching</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Find top candidates for your open roles
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Select a job and discover the strongest candidate matches ranked by relevance.
            </p>
          </div>

          {/* Main Content Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            {/* Step 1: Select Job */}
            <div className="space-y-6">
              <div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 1 — Select a Job</p>
                  <p className="text-lg font-semibold text-slate-950">Choose an active role to match against your candidate pool.</p>
                </div>

                <div className="mt-6 space-y-5">
                  <label className="block text-sm font-medium text-slate-700">Available jobs</label>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                    <select
                      value={selectedJobId}
                      onChange={(event) => setSelectedJobId(event.target.value)}
                      disabled={loadingJobs}
                      className="w-full bg-transparent text-sm text-slate-950 outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {loadingJobs ? 'Loading jobs...' : 'Select a job'}
                      </option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedJob && (
                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Selected role</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-950">{selectedJob.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-4">{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJobId && (
                    <button
                      type="button"
                      onClick={handleFindMatches}
                      disabled={loadingMatches}
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingMatches ? 'Finding matches...' : 'Find Matching Candidates'}
                    </button>
                  )}

                  {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: View Matched Candidates */}
              <div className="border-t border-slate-200 pt-8">
                <div className="space-y-2 mb-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 2 — View Matched Candidates</p>
                  <p className="text-lg font-semibold text-slate-950">Matched candidate ranking</p>
                  <p className="text-sm text-slate-600">Top candidates are ordered by match strength.</p>
                </div>

                {loadingMatches ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                    Finding the best candidate matches...
                  </div>
                ) : matches.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                    {selectedJobId
                      ? 'No candidates matched yet. Click "Find Matching Candidates" to start.'
                      : 'Select a job to see candidate matches.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700">Rank</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700">First Name</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700">Last Name</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700">Email</th>
                          <th className="px-6 py-4 text-center font-semibold text-slate-700">Match %</th>
                          <th className="px-6 py-4 text-center font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {matches.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-semibold text-slate-950">{candidate.rank}</td>
                            <td className="px-6 py-4 text-slate-950">{candidate.first_name || '—'}</td>
                            <td className="px-6 py-4 text-slate-950">{candidate.last_name || '—'}</td>
                            <td className="px-6 py-4 text-slate-600">{candidate.email || '—'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
                                {Math.round(candidate.score)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleViewCandidate(candidate.id)}
                                  className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:underline transition"
                                >
                                  View
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleSelectCandidate(candidate.id)}
                                  className="text-sm font-medium text-slate-950 hover:text-slate-700 hover:underline transition"
                                >
                                  Select
                                </button>
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
          </div>
        </div>
      </section>
    </main>
  );
}

