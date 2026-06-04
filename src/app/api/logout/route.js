export async function POST(req) {
  const cookieValue = `mellowToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  return Response.json(
    { success: true, message: 'Logged out successfully' },
    {
      status: 200,
      headers: {
        'Set-Cookie': cookieValue,
      },
    }
  );
}
