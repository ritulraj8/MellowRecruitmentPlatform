import bcrypt from 'bcryptjs';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const result = await pool.query(
      'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        message: 'Server error',
      },
      { status: 500 }
    );
  }
}