import { NextRequest, NextResponse } from 'next/server';
import { validateCASTicket } from '../../../lib/cas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const returnSite = searchParams.get('returnSite') || 'osdg.in';

  if (!ticket) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>CAS Authentication</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            .error { color: #e53e3e; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Authentication Error</h2>
            <p>No ticket provided</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'CAS_AUTH_ERROR', 
                error: 'no-ticket' 
              }, 'https://${returnSite}');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Validate ticket with CAS
  const serviceUrl = `https://osdg.iiit.ac.in/api/auth/callback?returnSite=${encodeURIComponent(returnSite)}`;
  const user = await validateCASTicket(ticket, serviceUrl);

  if (!user) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>CAS Authentication</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            .error { color: #e53e3e; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Validation Failed</h2>
            <p>Could not validate your credentials</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'CAS_AUTH_ERROR', 
                error: 'validation-failed' 
              }, 'https://${returnSite}');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Success! Redirect back with minimal page
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <style>
          body {
            margin: 0;
            background: #000;
            color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <p>Redirecting...</p>
        <script>
          const url = new URL('https://${returnSite}/');
          url.searchParams.set('username', ${JSON.stringify(user.username)});
          url.searchParams.set('name', ${JSON.stringify(user.name)});
          url.searchParams.set('email', ${JSON.stringify(user.email)});
          url.searchParams.set('casAuth', 'true');
          window.location.href = url.toString();
        </script>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
