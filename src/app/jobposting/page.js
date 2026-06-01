'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';

export default function JobPostingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const validationErrors = [];

    if (!title.trim()) {
      validationErrors.push('Job title is required.');
    } else if (title.trim().length > 100) {
      validationErrors.push('Job title cannot exceed 100 characters.');
    }

    if (!description.trim()) {
      validationErrors.push('Job description is required.');
    } else if (description.trim().length < 50) {
      validationErrors.push('Job description must be at least 50 characters.');
    }

    return validationErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors([data.message || 'Failed to post job.']);
        setLoading(false);
        return;
      }

      setSuccess('Job posted successfully! Redirecting to job listing...');
      setTitle('');
      setDescription('');
      setErrors([]);

      setTimeout(() => {
        router.push('/joblisting');
      }, 800);
    } catch (error) {
      setErrors(['Unable to save job. Please try again.']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <BackButton fallbackHref="/dashboard" forceFallback />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Job posting</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Add a new job opening
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Create a new job posting with title and description. Candidates will see this in the job listing.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50"
          >
            <div className="space-y-6">
              {errors.length > 0 && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">Please fix the following:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {success && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  ✓ {success}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Job Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Enter job title"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  Job Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Write a detailed description of the role, responsibilities, and qualifications."
                  className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Posting job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
