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

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const jobId = Number(resolvedParams?.id ?? '');

  if (!jobId || Number.isNaN(jobId)) {
    return new Response(JSON.stringify({ message: 'Invalid job ID.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const title = (body.title ?? '').toString().trim();
    const description = (body.description ?? '').toString().trim();

    if (!title || title.length > 100) {
      return new Response(
        JSON.stringify({ message: 'Job title is required and must be 100 characters or less.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!description || description.length < 50) {
      return new Response(
        JSON.stringify({ message: 'Job description is required and must be at least 50 characters.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await pool.query(
      'UPDATE "JOBS" SET title = $1, description = $2 WHERE id = $3 RETURNING id, title, description, created_at',
      [title, description, jobId]
    );

    if (!result.rows.length) {
      return new Response(JSON.stringify({ message: 'Job not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job updated successfully.',
        job: result.rows[0],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating job:', error.message);
    return new Response(JSON.stringify({ message: 'Failed to update job.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

