'use server';

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const jobId = Number(resolvedParams?.id ?? '');

  if (!jobId || Number.isNaN(jobId)) {
    return new Response(JSON.stringify({ message: 'Invalid job ID.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, title, description, created_at FROM "JOBS" WHERE id = $1 LIMIT 1',
      [jobId]
    );

    if (!result.rows.length) {
      return new Response(JSON.stringify({ message: 'Job not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error loading job:', error.message);
    return new Response(JSON.stringify({ message: 'Failed to load job.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
