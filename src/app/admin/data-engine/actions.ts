'use server';

import {
  createOrg,
  createCompany,
  createUser,
  issueApiToken,
} from '@/lib/data-engine';

export async function createOrgAction(name: string, slug: string) {
  try {
    const result = await createOrg(name, slug);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function createCompanyAction(orgId: string, name: string) {
  try {
    const result = await createCompany(orgId, name);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function createUserAction(
  orgId: string,
  email: string,
  password: string,
  role: string,
  companyId?: string
) {
  try {
    const result = await createUser(orgId, email, password, role, companyId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function issueApiTokenAction(userId: string, name: string) {
  try {
    const result = await issueApiToken(userId, name);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
