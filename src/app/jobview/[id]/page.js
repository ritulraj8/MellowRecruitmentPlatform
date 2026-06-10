'use client';

import { use, useEffect, useState } from 'react';
import BackButton from '../../../components/BackButton';

export default function JobViewPage({ params }) {
  const resolvedParams = use(params);
  const jobId = Number(resolvedParams?.id);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!jobId || Number.isNaN(jobId)) {
      setError('Invalid job ID.');
      setLoading(false);
      return;
    }

    async function loadJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found.');
          }
          throw new Error('Failed to load job details.');
        }
        const data = await response.json();
        setJob(data);
        setEditedTitle(data.title || '');
        setEditedDescription(data.description || '');
      } catch (err) {
        setError(err.message || 'Unable to load job. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  function validateForm() {
    const validationErrors = [];

    if (!editedTitle.trim()) {
      validationErrors.push('Job title is required.');
    } else if (editedTitle.trim().length > 100) {
      validationErrors.push('Job title cannot exceed 100 characters.');
    }

    if (!editedDescription.trim()) {
      validationErrors.push('Job description is required.');
    } else if (editedDescription.trim().length < 50) {
      validationErrors.push('Job description must be at least 50 characters.');
    }

    return validationErrors;
  }

  async function handleSave() {
    setErrors([]);
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle.trim(),
          description: editedDescription.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors([data.message || 'Failed to update job.']);
        return;
      }

      setSuccess('Job updated successfully!');
      setJob(data.job);
      
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 800);
    } catch (err) {
      setErrors(['Unable to update job. Please try again.']);
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-4xl text-center p-8">
            <p className="text-sm text-slate-600">Loading job details...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <h1 className="text-2xl font-semibold text-slate-950">{error || 'Job not found'}</h1>
            <p className="mt-4 text-sm text-slate-600">Please check the link and try again.</p>
            <div className="mt-6">
              <BackButton fallbackHref="/joblisting" forceFallback />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <BackButton fallbackHref="/joblisting" forceFallback />
          
          {isEditing ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Edit Job details</p>
              
              {errors.length > 0 && (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">Please fix the following:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {success && (
                <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  ✓ {success}
                </div>
              )}

              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                    Job Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
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
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={10}
                    placeholder="Write a detailed description of the role..."
                    className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(job.title);
                      setEditedDescription(job.description);
                      setErrors([]);
                      setSuccess('');
                    }}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Job details</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    {job.title}
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-slate-600">Posted on {formatDate(job.created_at)}</p>
                </div>
                <div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Edit Job
                  </button>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-sm uppercase tracking-[0.24em] text-slate-500">Description</h2>
                <p className="mt-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
