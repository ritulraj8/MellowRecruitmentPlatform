import { NextResponse } from 'next/server';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DEFAULT_STAGES = [
  'Initial Screening',
  'Phone / Video Interview',
  'Technical Assessment',
  'HR Interview',
  'Final Decision',
];

export async function POST(request) {
  try {
    const { candidateId, jobId } = await request.json();

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'candidateId and jobId are required' },
        { status: 400 }
      );
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM candidate_selections
      WHERE candidate_id = $1
      AND job_id = $2
      `,
      [candidateId, jobId]
    );

    let selectionId;

    if (existing.rows.length > 0) {
      selectionId = existing.rows[0].id;
    } else {
      const selectionResult = await pool.query(
        `
        INSERT INTO candidate_selections
        (candidate_id, job_id)
        VALUES ($1,$2)
        RETURNING id
        `,
        [candidateId, jobId]
      );

      selectionId = selectionResult.rows[0].id;

      for (const stage of DEFAULT_STAGES) {
        await pool.query(
          `
          INSERT INTO recruitment_steps
          (selection_id, stage_name, status)
          VALUES ($1,$2,'Pending')
          `,
          [selectionId, stage]
        );
      }
    }

    return NextResponse.json({
      success: true,
      selectionId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to create candidate selection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cs.id,
        cs.selected_at,

        c.id AS candidate_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,

        j.id AS job_id,
        j.title AS job_title

      FROM candidate_selections cs

      LEFT JOIN "CANDIDATES" c
        ON c.id = cs.candidate_id

      LEFT JOIN "JOBS" j
        ON j.id = cs.job_id

      ORDER BY cs.selected_at DESC
    `);

    return NextResponse.json({
      selections: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}