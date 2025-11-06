interface CASResponse {
  serviceResponse: {
    authenticationSuccess?: {
      attributes: {
        uid: string[];
        Name: string[];
        'E-Mail': string[];
      };
    };
    authenticationFailure?: {
      code: string;
      description: string;
    };
  };
}

interface CASUser {
  username: string;
  name: string;
  email: string;
}

const CAS_BASE_URL = 'https://login.iiit.ac.in/cas';

export async function validateCASTicket(
  ticket: string,
  service: string
): Promise<CASUser | null> {
  try {
    const validateUrl = `${CAS_BASE_URL}/serviceValidate?service=${encodeURIComponent(
      service
    )}&ticket=${encodeURIComponent(ticket)}&format=JSON`;

    const response = await fetch(validateUrl);
    const data: CASResponse = await response.json();

    console.log('CAS Response:', JSON.stringify(data, null, 2));

    if (data.serviceResponse.authenticationFailure) {
      console.error('CAS Authentication failed:', data.serviceResponse.authenticationFailure);
      return null;
    }

    const attributes = data.serviceResponse.authenticationSuccess?.attributes;
    if (!attributes || !attributes.uid || !attributes.uid[0]) {
      console.error('No user ID in CAS response');
      return null;
    }

    return {
      username: attributes.uid[0],
      name: attributes.Name?.[0] || attributes.uid[0],
      email: attributes['E-Mail']?.[0] || `${attributes.uid[0]}@students.iiit.ac.in`,
    };
  } catch (error) {
    console.error('CAS validation error:', error);
    return null;
  }
}