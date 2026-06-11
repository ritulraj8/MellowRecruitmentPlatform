'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BackButton from '../../components/BackButton';
import CustomSelect from '../../components/CustomSelect';

const STAGE_ORDER = [
  'Initial Screening',
  'Phone / Video Interview',
  'Technical Assessment',
  'HR Interview',
  'Final Decision',
];

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
];

function CandidateSelectionComponent() {
    const searchParams = useSearchParams();

    const selectionId = searchParams.get('selectionId');

    const [selection, setSelection] = useState(null);
    const [allSelections, setAllSelections] = useState([]);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectionId) {
            loadData();
        } else {
            loadSelections();
        }
    }, [selectionId]);

    async function loadSelections() {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                '/api/candidate-selections'
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to load selected candidates'
                );
            }

            const data = await response.json();

            setAllSelections(data.selections || []);
        } catch (err) {
            console.error(err);
            setError(
                'Failed to load selected candidates.'
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadData() {
        try {
            setLoading(true);
            setError('');

            const selectionResponse = await fetch(
                `/api/candidate-selections/${selectionId}`
            );

            if (!selectionResponse.ok) {
                throw new Error('Failed to load selection');
            }

            const selectionData = await selectionResponse.json();

            const stepsResponse = await fetch(
                `/api/recruitment-steps?selectionId=${selectionId}`
            );

            if (!stepsResponse.ok) {
                throw new Error('Failed to load recruitment steps');
            }

            const stepsData = await stepsResponse.json();

            setSelection(selectionData.selection);
            setSteps(stepsData.steps || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load candidate selection.');
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date) {
        if (!date) return '—';

        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    function updateStep(stepId, field, value) {
        setSteps((current) =>
            current.map((step) =>
                step.id === stepId
                    ? {
                        ...step,
                        [field]: value,
                    }
                    : step
            )
        );
    }

    async function saveStep(step) {
        try {
            setSavingId(step.id);

            const response = await fetch(
                `/api/recruitment-steps/${step.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: step.status,
                        notes: step.notes,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save step');
            }

            const data = await response.json();

            setSteps((current) =>
                current.map((s) =>
                    s.id === step.id
                        ? {
                            ...data.step,
                        }
                        : s
                )
            );
        } catch (err) {
            console.error(err);
            alert('Failed to save changes.');
        } finally {
            setSavingId(null);
        }
    }

    if (!selectionId) {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-950">
                <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">

                        <BackButton
                            fallbackHref="/dashboard"
                            forceFallback
                        />

                        <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">
                                Candidate Selection
                            </p>

                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                                Selected Candidates
                            </h1>

                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                                View all selected candidates and
                                track their recruitment progress.
                            </p>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">

                            {loading ? (
                                <div className="text-center py-10">
                                    Loading...
                                </div>
                            ) : error ? (
                                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-4 py-3 text-left">
                                                    Candidate
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Email
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Phone
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Job
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Selected Date
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {allSelections.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-4">
                                                        {item.first_name}{' '}
                                                        {item.last_name}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {item.email}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {item.phone}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {item.job_title}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {formatDate(
                                                            item.selected_at
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <button
                                                            onClick={() =>
                                                            (window.location.href =
                                                                `/candidateselection?selectionId=${item.id}`)
                                                            }
                                                            className="font-semibold text-cyan-700 hover:text-cyan-900"
                                                        >
                                                            View
                                                        </button>
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

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <BackButton
                        fallbackHref="/candidateselection"
                        forceFallback
                    />

                    {/* Header */}
                    <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                        <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">
                            Candidate Selection
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                            Recruitment Pipeline
                        </h1>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                            Track candidate progress through each stage of the
                            recruitment process and record recruiter notes.
                        </p>
                    </div>

                    {loading ? (
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-2xl shadow-slate-200/50">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Candidate Details */}
                            <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                                <div className="space-y-2">
                                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                                        Candidate Information
                                    </p>

                                    <h2 className="text-2xl font-semibold text-slate-950">
                                        {selection.first_name}{' '}
                                        {selection.last_name}
                                    </h2>
                                </div>

                                <div className="mt-8 grid gap-6 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {selection.email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {selection.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Selected Job
                                        </p>
                                        <p className="font-medium">
                                            {selection.job_title}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Selection Date
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(selection.selected_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Recruitment Steps */}
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                                <div className="mb-8">
                                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                                        Recruitment Stages
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold">
                                        Candidate Progress
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {steps.map((step) => {
                                        const currentStageIndex = STAGE_ORDER.indexOf(step.stage_name);
                                        let isLocked = false;
                                        let lockedByStage = '';

                                        for (let i = 0; i < currentStageIndex; i++) {
                                            const prevStageName = STAGE_ORDER[i];
                                            const prevStep = steps.find(s => s.stage_name === prevStageName);
                                            if (!prevStep || prevStep.status !== 'Completed') {
                                                isLocked = true;
                                                lockedByStage = prevStageName;
                                                break;
                                            }
                                        }
                                        const cardStyle = isLocked
                                            ? 'bg-slate-100/30 border-slate-200/40 opacity-65'
                                            : step.status === 'Completed' || step.status === 'Accepted'
                                            ? 'bg-green-50/20 border-green-500/30 dark:bg-green-50/5 dark:border-green-500/20'
                                            : step.status === 'Rejected'
                                            ? 'bg-red-50/20 border-red-500/30 dark:bg-red-50/5 dark:border-red-500/20'
                                            : step.status === 'In Progress'
                                            ? 'bg-cyan-50/30 border-cyan-500/40 dark:bg-cyan-50/5 dark:border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                                            : step.status === 'On Hold'
                                            ? 'bg-amber-50/20 border-amber-500/30 dark:bg-amber-50/5 dark:border-amber-500/20'
                                            : 'bg-slate-50 border-slate-200';

                                        return (
                                            <div
                                                key={step.id}
                                                className={`rounded-[1.75rem] border p-6 transition-all ${cardStyle}`}
                                            >
                                                <div className="flex flex-col gap-5">
                                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-slate-950">
                                                                {step.stage_name}
                                                            </h3>

                                                            <p className="mt-2 text-xs text-slate-500">
                                                                Last updated:{' '}
                                                                {formatDate(step.updated_at)}
                                                            </p>
                                                        </div>
                                                        {isLocked && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                                Locked (Requires {lockedByStage})
                                                            </span>
                                                        )}
                                                    </div>

                                                    {step.stage_name === 'Final Decision' ? (
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() =>
                                                                    updateStep(step.id, 'status', 'Accepted')
                                                                }
                                                                disabled={isLocked}
                                                                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                                                                    isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                                                } ${step.status === 'Accepted'
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-green-100 text-green-700'
                                                                    }`}
                                                            >
                                                                Accept
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    updateStep(step.id, 'status', 'Rejected')
                                                                }
                                                                disabled={isLocked}
                                                                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                                                                    isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                                                } ${step.status === 'Rejected'
                                                                        ? 'bg-red-600 text-white'
                                                                        : 'bg-red-100 text-red-700'
                                                                    }`}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                    Status
                                                                </label>
                                                                <CustomSelect
                                                                    value={step.status}
                                                                    disabled={isLocked}
                                                                    onChange={(val) =>
                                                                        updateStep(
                                                                            step.id,
                                                                            'status',
                                                                            val
                                                                        )
                                                                    }
                                                                    options={STATUS_OPTIONS}
                                                                    bgColorClass="bg-white"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                    Notes
                                                                </label>
                                                                 <textarea
                                                                    rows={5}
                                                                    value={step.notes || ''}
                                                                    disabled={isLocked}
                                                                    onChange={(e) =>
                                                                        updateStep(
                                                                            step.id,
                                                                            'notes',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none disabled:opacity-50 disabled:bg-slate-100/50 dark:disabled:bg-slate-800/40"
                                                                 />
                                                            </div>
                                                        </>
                                                    )}

                                                    <div>
                                                        <button
                                                            onClick={() =>
                                                                saveStep(step)
                                                            }
                                                            disabled={
                                                                isLocked || savingId === step.id
                                                            }
                                                            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {savingId === step.id
                                                                ? 'Saving...'
                                                                : 'Save Changes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

import { Suspense } from 'react';

export default function CandidateSelectionPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center px-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/40">
                    <p className="text-sm font-medium text-slate-700">Loading selection...</p>
                </div>
            </main>
        }>
            <CandidateSelectionComponent />
        </Suspense>
    );
}