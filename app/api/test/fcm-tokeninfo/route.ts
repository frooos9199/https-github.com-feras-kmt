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
    project_id: projectId,
    private_key_id: privateKeyId,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: clientId,
  };
}

export async function GET() {
  try {
    const credentials = getSanitizedCredentials();
    const jwtClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const tokens = await jwtClient.authorize();
    const accessToken = tokens?.access_token;
    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'No access token returned from authorize()' },
        { status: 500 }
      );
    }

    const tokenInfoResp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
      { method: 'GET' }
    );
    const tokenInfoText = await tokenInfoResp.text();

    return NextResponse.json({
      ok: true,
      accessTokenLength: accessToken.length,
      tokenInfoStatus: tokenInfoResp.status,
      tokenInfoOk: tokenInfoResp.ok,
      // tokeninfo may include scopes, audience, expiry - safe to expose
      tokenInfo: (() => {
        try {
          return JSON.parse(tokenInfoText);
        } catch {
          return tokenInfoText;
        }
      })(),
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
