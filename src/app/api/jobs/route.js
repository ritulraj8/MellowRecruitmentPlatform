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
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');

    if (pageParam !== null) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.max(1, parseInt(limitParam || '10', 10) || 10);
      const offset = (page - 1) * limit;

      let result;
      let countResult;
      if (search) {
        countResult = await pool.query(
          'SELECT COUNT(*) FROM "JOBS" WHERE title ILIKE $1',
          [`%${search}%`]
        );
        result = await pool.query(
          'SELECT id, title, description, created_at FROM "JOBS" WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [`%${search}%`, limit, offset]
        );
      } else {
        countResult = await pool.query('SELECT COUNT(*) FROM "JOBS"');
        result = await pool.query(
          'SELECT id, title, description, created_at FROM "JOBS" ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );
      }

      const total = parseInt(countResult.rows[0].count, 10);

      return Response.json({
        jobs: result.rows,
        total,
        page,
        limit,
      });
    } else {
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
    }
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
