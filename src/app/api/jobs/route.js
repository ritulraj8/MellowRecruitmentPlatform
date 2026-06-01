'use server';

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

export async function GET(request) {
  try {
    await ensureJobsTable();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim() ?? '';

    let result;
    if (search) {
      result = await pool.query(
        'SELECT id, title, description, created_at FROM "JOBS" WHERE title ILIKE $1 ORDER BY created_at DESC',
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        'SELECT id, title, description, created_at FROM "JOBS" ORDER BY created_at DESC'
      );
    }

    return Response.json({ jobs: result.rows });
  } catch (error) {
    console.error('Error loading jobs:', error.message);
    return Response.json({ message: 'Failed to load jobs.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureJobsTable();

    const body = await request.json();
    const title = (body.title ?? '').toString().trim();
    const description = (body.description ?? '').toString().trim();

    if (!title || title.length > 100) {
      return Response.json(
        { message: 'Job title is required and must be 100 characters or less.' },
        { status: 400 }
      );
    }

    if (!description || description.length < 50) {
      return Response.json(
        { message: 'Job description is required and must be at least 50 characters.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO "JOBS" (title, description) VALUES ($1, $2) RETURNING id',
      [title, description]
    );

    return Response.json(
      { success: true, message: 'Job posted successfully.', jobId: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving job:', error.message);
    return Response.json({ message: 'Failed to save job.' }, { status: 500 });
  }
}
