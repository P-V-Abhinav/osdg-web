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
              }, 'https://' + returnSite);
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
              }, 'https://' + returnSite);
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

  // Success! Send user data back to the parent window
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>CAS Authentication Success</title>
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
          .success { color: #38a169; }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 1rem auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="success">✅ Authentication Successful!</h2>
          <p>Welcome, <strong>${user.name}</strong></p>
          <div class="spinner"></div>
          <p style="color: #666;">Redirecting you back...</p>
        </div>
        <script>
          const userData = {
            type: 'CAS_AUTH_SUCCESS',
            user: {
              username: ${JSON.stringify(user.username)},
              name: ${JSON.stringify(user.name)},
              email: ${JSON.stringify(user.email)}
            }
          };
          
          if (window.opener) {
            // Send data to parent window
            window.opener.postMessage(userData, 'https://' + returnSite);
            setTimeout(() => window.close(), 1500);
          } else {
            // Fallback: redirect with URL params
            const url = new URL('https://' + returnSite + '/');
            url.searchParams.set('username', ${JSON.stringify(user.username)});
            url.searchParams.set('email', ${JSON.stringify(user.email)});
            url.searchParams.set('casAuth', 'true');
            window.location.href = url.toString();
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