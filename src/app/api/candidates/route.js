import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const all = searchParams.get('all') === 'true';
    const { search = '', page = '1', limit = '10' } = Object.fromEntries(searchParams.entries());
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);
    const offset = (pageNumber - 1) * pageSize;

    const searchValue = `%${search.trim().toLowerCase()}%`;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM "CANDIDATES" WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1',
      [searchValue]
    );
    const total = Number(countResult.rows[0]?.total ?? 0);

    let rowsResult;
    if (all) {
      rowsResult = await pool.query(
        'SELECT id, first_name, last_name, email, phone, resume_path FROM "CANDIDATES" WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1 ORDER BY id DESC',
        [searchValue]
      );
    } else {
      rowsResult = await pool.query(
        'SELECT id, first_name, last_name, email, phone, resume_path FROM "CANDIDATES" WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
        [searchValue, pageSize, offset]
      );
    }

    // Convert bytea resume_path to base64
    const candidatesWithEncodedResume = rowsResult.rows.map((row) => ({
      ...row,
      resume_path: row.resume_path 
        ? Buffer.from(row.resume_path).toString('base64')
        : null,
    }));

    return Response.json({
      candidates: candidatesWithEncodedResume,
      total,
      page: all ? 1 : pageNumber,
      limit: all ? total : pageSize,
    });
  } catch (error) {
    console.error('Error loading candidates:', error.message);
    return Response.json({ message: error.message || 'Failed to load candidates.' }, { status: 500 });
  }
}
