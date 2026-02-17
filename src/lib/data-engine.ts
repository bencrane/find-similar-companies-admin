const DATA_ENGINE_API_KEY = process.env.DATA_ENGINE_SUPER_ADMIN_API_KEY;
const DATA_ENGINE_BASE_URL = process.env.DATA_ENGINE_BASE_URL || 'https://api.dataengine.run';

async function dataEngineRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DATA_ENGINE_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DATA_ENGINE_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Data Engine API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Super-admin endpoints
export async function createOrg(name: string, slug: string) {
  return dataEngineRequest('/api/super-admin/orgs/create', {
    method: 'POST',
    body: JSON.stringify({ name, slug }),
  });
}

export async function createCompany(orgId: string, name: string) {
  return dataEngineRequest('/api/super-admin/companies/create', {
    method: 'POST',
    body: JSON.stringify({ org_id: orgId, name }),
  });
}

export async function createUser(
  orgId: string,
  email: string,
  password: string,
  role: string,
  companyId?: string
) {
  return dataEngineRequest('/api/super-admin/users/create', {
    method: 'POST',
    body: JSON.stringify({
      org_id: orgId,
      email,
      password,
      role,
      ...(companyId && { company_id: companyId }),
    }),
  });
}

export async function issueApiToken(userId: string, name: string) {
  return dataEngineRequest<{ token: string }>('/api/super-admin/api-tokens/create', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, name }),
  });
}
