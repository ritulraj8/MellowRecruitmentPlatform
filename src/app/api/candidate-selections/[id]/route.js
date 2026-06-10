import { NextResponse } from 'next/server';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request, context) {
  try {
    const params = await context.params;
    const selectionId = Number(params.id);

    console.log("selectionId:", selectionId);

    const result = await pool.query(
      `
      SELECT
          cs.id,
          cs.selected_at,

          c.id as candidate_id,
          c.first_name,
          c.last_name,
          c.email,
          c.phone,

          j.id as job_id,
          j.title as job_title

      FROM candidate_selections cs

      LEFT JOIN "CANDIDATES" c
          ON c.id = cs.candidate_id

      LEFT JOIN "JOBS" j
          ON j.id = cs.job_id

      WHERE cs.id = $1
      `,
      [selectionId]
    );

    console.log("Selection query result:", result.rows);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Selection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      selection: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}