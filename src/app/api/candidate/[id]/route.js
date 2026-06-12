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
    'SELECT id, first_name, last_name, email, phone, TO_CHAR(date_of_birth, \'YYYY-MM-DD\') AS date_of_birth FROM "CANDIDATES" WHERE id = $1 LIMIT 1',
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

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const candidateId = Number(resolvedParams?.id ?? '');
  if (!candidateId || Number.isNaN(candidateId)) {
    return new Response(JSON.stringify({ message: 'Invalid candidate ID.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await pool.query(
      'DELETE FROM "CANDIDATES" WHERE id = $1 RETURNING id',
      [candidateId]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'Candidate not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Candidate deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return new Response(JSON.stringify({ message: error.message || 'Server error deleting candidate.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
