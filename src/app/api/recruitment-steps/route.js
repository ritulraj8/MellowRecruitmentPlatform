import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const selectionId = searchParams.get('selectionId');

    if (!selectionId) {
      return NextResponse.json(
        { error: 'selectionId required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        id,
        selection_id,
        stage_name,
        status,
        notes,
        updated_at
      FROM recruitment_steps
      WHERE selection_id = $1
      ORDER BY id
      `,
      [selectionId]
    );

    return NextResponse.json({
      steps: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to fetch recruitment steps' },
      { status: 500 }
    );
  }
}