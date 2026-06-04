// src/lib/jwt.js

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

const SECRET_KEY = process.env.JWT_SECRET || 'mellow-secret-key-12345-temporary-fallback-do-not-use-in-prod';

export async function signJWT(payload, secret = SECRET_KEY) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Set default exp claim if not set, e.g. 30 minutes
  if (!payload.exp) {
    payload.exp = Math.floor(Date.now() / 1000) + 1800; // 30 mins
  }
  
  const encodedHeader = arrayBufferToBase64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = arrayBufferToBase64Url(encoder.encode(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );

  const encodedSignature = arrayBufferToBase64Url(signature);
  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyJWT(token, secret = SECRET_KEY) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBuffer = base64UrlToArrayBuffer(encodedSignature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(dataToSign)
    );

    if (!isValid) return null;

    const payloadStr = new TextDecoder().decode(base64UrlToArrayBuffer(encodedPayload));
    const payload = JSON.parse(payloadStr);

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
