import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import BackButton from '../../../components/BackButton';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function CandidateView({ params }) {
  const resolvedParams = await params;
  const candidateId = Number(resolvedParams.id);
  if (!candidateId || Number.isNaN(candidateId)) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <h1 className="text-2xl font-semibold text-slate-950">Invalid candidate ID</h1>
            <p className="mt-4 text-sm text-slate-600">Please check the link and try again.</p>
          </div>
        </section>
      </main>
    );
  }

  const result = await pool.query(
    'SELECT id, first_name, last_name, email, phone, date_of_birth FROM "CANDIDATES" WHERE id = $1 LIMIT 1',
    [candidateId]
  );

  const candidate = result.rows[0];

  if (!candidate) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <h1 className="text-2xl font-semibold text-slate-950">Candidate not found</h1>
            <p className="mt-4 text-sm text-slate-600">This candidate either does not exist or has been removed.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <BackButton fallbackHref="/candidatelist" />
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-600">Candidate details</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {candidate.first_name} {candidate.last_name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              View candidate information and download the uploaded resume.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">First Name</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{candidate.first_name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Last Name</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{candidate.last_name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{candidate.email}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Phone</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{candidate.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Date of Birth</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{formatDate(candidate.date_of_birth)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={`/api/candidate/${candidate.id}/resume`}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Download resume
              </a>
              <a
                href="/candidatelist"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Back to candidate list
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
