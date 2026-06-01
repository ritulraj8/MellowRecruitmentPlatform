'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Back', fallbackHref = '/', forceFallback = false }) {
  const router = useRouter();

  function handleBack() {
    if (!forceFallback && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
