import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req) {
  try {
    const { search = '', page = '1', limit = '10' } = Object.fromEntries(req.nextUrl.searchParams.entries());
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);
    const offset = (pageNumber - 1) * pageSize;

    const searchValue = `%${search.trim().toLowerCase()}%`;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM "CANDIDATES" WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1',
      [searchValue]
    );
    const total = Number(countResult.rows[0]?.total ?? 0);

    const rowsResult = await pool.query(
      'SELECT id, first_name, last_name, email, phone FROM "CANDIDATES" WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
      [searchValue, pageSize, offset]
    );

    return Response.json({
      candidates: rowsResult.rows,
      total,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error('Error loading candidates:', error.message);
    return Response.json({ message: error.message || 'Failed to load candidates.' }, { status: 500 });
  }
}
