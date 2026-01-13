import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSanitizedCredentials() {
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').replace(/^mailto:/i, '');
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID || '';
  const clientId = process.env.FIREBASE_CLIENT_ID || '';

  const rawPrivateKey = (process.env.FIREBASE_PRIVATE_KEY || '').trim().replace(/^['\"]|['\"]$/g, '');
  const decodedPrivateKey = rawPrivateKey.includes('-----BEGIN')
    ? rawPrivateKey
    : Buffer.from(rawPrivateKey.replace(/\s+/g, ''), 'base64').toString('utf-8');
  const privateKey = decodedPrivateKey.replace(/\\n/g, '\n');

  return {
    type: 'service_account',
    project_id: projectId,
    private_key_id: privateKeyId,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: clientId,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    universe_domain: 'googleapis.com',
  };
}

export async function GET() {
  try {
    const credentials = getSanitizedCredentials();

    const jwtClient = new JWT({
      email: (credentials as any).client_email,
      key: (credentials as any).private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const tokens = await jwtClient.authorize();
    const accessToken = tokens?.access_token;

    return NextResponse.json({
      ok: true,
      hasAccessToken: typeof accessToken === 'string' && accessToken.length > 0,
      accessTokenLength: typeof accessToken === 'string' ? accessToken.length : 0,
      projectIdPresent: !!credentials.project_id,
      clientEmailPresent: !!credentials.client_email,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
