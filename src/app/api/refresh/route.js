import { verifyJWT } from '@/lib/jwt';

export async function POST(req) {
  const tokenCookie = req.cookies.get('mellowToken');
  const token = tokenCookie?.value;

  if (!token) {
    return Response.json(
      { success: false, message: 'Unauthorized: No token found' },
      { status: 401 }
    );
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    // Clear cookie
    const clearCookieValue = `mellowToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    return Response.json(
      { success: false, message: 'Unauthorized: Invalid token' },
      {
        status: 401,
        headers: {
          'Set-Cookie': clearCookieValue,
        },
      }
    );
  }

  // Refresh cookie with 30 minutes
  const cookieValue = `mellowToken=${token}; HttpOnly; Path=/; Max-Age=1800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

  return Response.json(
    { success: true, message: 'Session refreshed' },
    {
      status: 200,
      headers: {
        'Set-Cookie': cookieValue,
      },
    }
  );
}
