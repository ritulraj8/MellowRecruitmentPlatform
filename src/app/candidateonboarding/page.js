'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BackButton from '../../components/BackButton';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?:\+91[\s-]?[6-9]\d{9}|[6-9]\d{9}|\+?[1-9]\d{1,14})$/;
const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];

function CandidateOnboardingForm() {
  const searchParams = useSearchParams();
  const [candidateId, setCandidateId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    const idParam = searchParams?.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (!id || Number.isNaN(id)) return;

    setCandidateId(id);
    setIsEditMode(true);
    setLoadingCandidate(true);

    fetch(`/api/candidate/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Unable to load candidate details.');
        }
        return res.json();
      })
      .then((data) => {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setDob(data.date_of_birth ? data.date_of_birth.slice(0, 10) : '');
      })
      .catch((error) => {
        setErrors([error.message || 'Failed to load candidate details.']);
      })
      .finally(() => {
        setLoadingCandidate(false);
      });
  }, [searchParams]);

  function validateAge(dobValue) {
    if (!dobValue) return false;
    const birthDate = new Date(dobValue);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    return age > 16 || (age === 16 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
  }

  function validateFile(file) {
    if (!file) {
      return isEditMode ? '' : 'Resume file is required.';
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return 'Resume must be PDF, DOC, DOCX, or TXT.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Resume file must be 5 MB or smaller.';
    }
    return '';
  }

  function handleFileChange(event) {
    setResumeFile(event.target.files?.[0] || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSuccess('');

    const validationErrors = [];

    if (!firstName.trim()) {
      validationErrors.push('First name is required.');
    } else if (firstName.trim().length > 50) {
      validationErrors.push('First name cannot exceed 50 characters.');
    }

    if (!lastName.trim()) {
      validationErrors.push('Last name is required.');
    } else if (lastName.trim().length > 50) {
      validationErrors.push('Last name cannot exceed 50 characters.');
    }

    if (!email.trim()) {
      validationErrors.push('Email address is required.');
    } else if (!emailRegex.test(email.trim())) {
      validationErrors.push('Enter a valid email address.');
    }

    if (!phone.trim()) {
      validationErrors.push('Phone number is required.');
    } else if (!phoneRegex.test(phone.trim())) {
      validationErrors.push('Phone must be a valid 10-digit Indian or international number.');
    }

    if (!dob) {
      validationErrors.push('Date of birth is required.');
    } else if (!validateAge(dob)) {
      validationErrors.push('Candidate must be at least 16 years old.');
    }

    const fileError = validateFile(resumeFile);
    if (fileError) {
      validationErrors.push(fileError);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('firstName', firstName.trim());
      submitFormData.append('lastName', lastName.trim());
      submitFormData.append('email', email.trim());
      submitFormData.append('phone', phone.trim());
      submitFormData.append('dob', dob);
      if (resumeFile) {
        submitFormData.append('resume', resumeFile);
      }
      if (isEditMode && candidateId) {
        submitFormData.append('candidateId', String(candidateId));
      }

      const response = await fetch('/api/candidate-onboarding', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.message || 'Failed to save candidate details.']);
        setLoading(false);
        return;
      }

      setSuccess(isEditMode ? 'Candidate details updated successfully.' : 'Candidate details saved successfully.');
      setErrors([]);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDob('');
      setResumeFile(null);
      setFileInputKey((prev) => prev + 1);
      setLoading(false);
    } catch (err) {
      setErrors(['Something went wrong. Please try again.']);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <BackButton fallbackHref="/dashboard" forceFallback={true} />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Candidate onboarding</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {isEditMode ? 'Edit candidate details' : 'Add a new candidate'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {isEditMode
                ? 'Update the candidate profile below. Leave resume blank to keep the current file.'
                : 'Enter candidate details and upload a resume in one clean form.'}
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

              {loadingCandidate && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading candidate details...
                </div>
              )}

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  maxLength={50}
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={true}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  maxLength={50}
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={true}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={true}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={true}
                  placeholder="+91 98765 43210"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required={true}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700">
                  Resume File
                </label>
                <input
                  key={fileInputKey}
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 file:rounded-3xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white file:font-semibold file:hover:bg-slate-800"
                />
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {isEditMode
                    ? 'Leave blank to keep the current resume file.'
                    : 'Accepted formats: PDF, DOC, DOCX, TXT. Max size 5 MB.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || loadingCandidate}
                className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </div>
                ) : (
                  isEditMode ? 'Update candidate' : 'Save candidate'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

import { Suspense } from 'react';

export default function CandidateOnboarding() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center px-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-700">Loading form...</p>
        </div>
      </main>
    }>
      <CandidateOnboardingForm />
    </Suspense>
  );
}
