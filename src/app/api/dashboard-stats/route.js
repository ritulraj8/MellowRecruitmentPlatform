import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureJobsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "JOBS" (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    await ensureJobsTable();

    const candidateResult = await pool.query('SELECT COUNT(*) AS total FROM "CANDIDATES"');
    const totalCandidates = Number(candidateResult.rows[0]?.total ?? 0);

    const jobsResult = await pool.query('SELECT COUNT(*) AS total FROM "JOBS"');
    const totalJobs = Number(jobsResult.rows[0]?.total ?? 0);

    const jobsLast30DaysResult = await pool.query(
      'SELECT COUNT(*) AS total FROM "JOBS" WHERE created_at >= NOW() - INTERVAL \'30 days\''
    );
    const totalJobsLast30Days = Number(jobsLast30DaysResult.rows[0]?.total ?? 0);

    return Response.json({ totalCandidates, totalJobs, totalJobsLast30Days });
  } catch (error) {
    console.error('Error loading dashboard stats:', error.message);
    return Response.json(
      { message: error.message || 'Failed to load dashboard stats.' },
      { status: 500 }
    );
  }
}
