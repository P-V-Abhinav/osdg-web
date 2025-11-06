import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = 'https://login.iiit.ac.in/cas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnSite = searchParams.get('returnTo') || 'osdg.in';
  
  // Build the callback URL on osdg.iiit.ac.in
  const callbackUrl = `https://osdg.iiit.ac.in/api/auth/callback?returnSite=${encodeURIComponent(returnSite)}`;
  
  // Redirect to CAS login
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(callbackUrl)}`;
  
  return NextResponse.redirect(casLoginUrl);
}