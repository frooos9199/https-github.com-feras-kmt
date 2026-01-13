import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').replace(/^mailto:/i, '');
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID || '';
  const clientId = process.env.FIREBASE_CLIENT_ID || '';

  return NextResponse.json({
    env: process.env.NODE_ENV,
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    hasPrivateKeyId: !!privateKeyId,
    hasClientId: !!clientId,
    projectIdLength: projectId.length,
    clientEmailLength: clientEmail.length,
    clientEmailHasMailtoPrefix: /^mailto:/i.test(process.env.FIREBASE_CLIENT_EMAIL || ''),
    privateKeyLength: privateKey.length,
    privateKeyLooksLikePem: privateKey.includes('-----BEGIN'),
    privateKeyLooksBase64: !privateKey.includes('-----BEGIN') && /^[A-Za-z0-9+/=\s]+$/.test(privateKey) && privateKey.length > 200,
    privateKeyIdLength: privateKeyId.length,
    clientIdLength: clientId.length,
  });
}
