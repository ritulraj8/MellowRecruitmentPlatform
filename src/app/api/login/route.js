import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { signJWT } from '@/lib/jwt';



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

    const token = await signJWT({
      userId: user.id,
      email: user.email,
    });

    const cookieValue = `mellowToken=${token}; HttpOnly; Path=/; Max-Age=1800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    return Response.json(
      {
        success: true,
        message: 'Login successful',
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieValue,
        },
      }
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