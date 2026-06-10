'use server';

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const candidateId = Number(resolvedParams?.id ?? '');
  if (!candidateId || Number.isNaN(candidateId)) {
    return new Response(JSON.stringify({ message: 'Invalid candidate ID.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await pool.query(
    'SELECT id, first_name, last_name, email, phone, date_of_birth FROM "CANDIDATES" WHERE id = $1 LIMIT 1',
    [candidateId]
  );

  const candidate = result.rows[0];

  if (!candidate) {
    return new Response(JSON.stringify({ message: 'Candidate not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(candidate), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
