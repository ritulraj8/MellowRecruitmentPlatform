import { NextResponse } from 'next/server';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const stepId = Number(params.id);

    const { status, notes } = await request.json();

    const allowedStatuses = [
      'Pending',
      'In Progress',
      'Completed',
      'On Hold',
    'Rejected',
    'Accepted',
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE recruitment_steps
      SET
        status = $1,
        notes = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [status, notes || '', stepId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Recruitment step not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      step: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to update recruitment step' },
      { status: 500 }
    );
  }
}