
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-cyan-400/20 to-transparent blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-12 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-10">
            <p className="text-sm uppercase tracking-[0.36em] text-cyan-600">Welcome to</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Mellow
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              The recruitment platform built to simplify hiring, highlight your employer brand, and deliver better candidate experiences.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-8">
              <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-800 shadow-sm">
                Recruiting, reimagined
              </span>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Build winning teams with talent discovery that feels effortless.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Mellow helps founders, hiring teams, and candidates connect faster with a smarter recruitment flow, beautiful job branding, and interview-ready tools.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a href="/loginpage" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800">
                  Explore Mellow
                </a>
                <a href="#cta" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50">
                  See why teams choose us
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-slate-500 to-slate-950" />
              <div className="space-y-6">
                <div className="rounded-3xl bg-slate-950 px-6 py-5 text-white shadow-xl shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Mellow in numbers</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
                    <div>
                      <p className="text-3xl font-semibold">120+</p>
                      <p className="mt-2 text-sm text-slate-300">Top roles filled</p>
                    </div>
                    <div>
                      <p className="text-3xl font-semibold">24h</p>
                      <p className="mt-2 text-sm text-slate-300">Faster candidate matches</p>
                    </div>
                    <div>
                      <p className="text-3xl font-semibold">98%</p>
                      <p className="mt-2 text-sm text-slate-300">interview-ready hires</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">Your hiring hub</h2>
                  <p className="text-sm leading-7 text-slate-600">
                    Keep every job opening, candidate note, and interview plan in one calm experience. Mellow turns recruiting from chaotic to confident.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/80">
                      <p className="text-sm font-semibold text-slate-950">Smart matching</p>
                      <p className="mt-2 text-sm text-slate-600">Show candidates exactly what matters most.</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/80">
                      <p className="text-sm font-semibold text-slate-950">Team-friendly workflow</p>
                      <p className="mt-2 text-sm text-slate-600">Invite reviewers, share feedback, and move faster.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="features" className="mt-24 grid gap-10 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Candidate-first</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Brand your roles beautifully</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Impress applicants with clear, compelling job posts that highlight culture, growth, and what makes your team unique.
              </p>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Focus amplified</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Stop chasing resumes</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Get matched with candidates who fit your team and let meaningful conversations happen sooner.
              </p>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Hire smarter</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Make every interview count</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Keep interview guides, candidate notes, and feedback in one place so decisions are faster and fairer.
              </p>
            </article>
          </section>

          <section id="cta" className="mt-24 rounded-[2rem] bg-gradient-to-r from-cyan-500 to-slate-950 px-8 py-14 text-white shadow-2xl shadow-cyan-500/20 sm:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-100">Start hiring with clarity</p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                A smoother recruitment journey starts with Mellow.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-cyan-100/90">
                Turn job-posting stress into confident hiring with an interface that looks polished, feels intuitive, and helps every candidate experience shine.
              </p>
              <div className="mt-8 flex justify-center">
                <a href="/loginpage" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/15 transition hover:bg-slate-100">
                  Launch your first job post
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
