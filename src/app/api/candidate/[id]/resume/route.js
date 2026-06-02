'use server';

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function getFileMetadata(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes.length >= 4) {
    const header = Array.from(bytes.slice(0, 4))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    if (header.startsWith('25504446')) {
      return { mime: 'application/pdf', extension: 'pdf' };
    }
    if (header === 'D0CF11E0') {
      return { mime: 'application/msword', extension: 'doc' };
    }
    if (header === '504B0304') {
      return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx' };
    }
  }

  const textSample = bytes.slice(0, 64).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  const textLike = /^[\x09\x0A\x0D\x20-\x7E]*$/.test(textSample);
  if (textLike) {
    return { mime: 'text/plain', extension: 'txt' };
  }

  return { mime: 'application/octet-stream', extension: 'bin' };
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const candidateId = Number(resolvedParams?.id ?? '');
  if (!candidateId || Number.isNaN(candidateId)) {
    return new Response(JSON.stringify({ error: 'Invalid candidate ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await pool.query(
    'SELECT resume_path FROM "CANDIDATES" WHERE id = $1 LIMIT 1',
    [candidateId]
  );

  const row = result.rows[0];
  if (!row || !row.resume_path) {
    return new Response(JSON.stringify({ error: 'Resume not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resumeBytes = row.resume_path;
  const { mime, extension } = getFileMetadata(resumeBytes);

  return new Response(resumeBytes, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="candidate-${candidateId}-resume.${extension}"`,
    },
  });
}
