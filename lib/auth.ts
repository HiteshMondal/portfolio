import { SignJWT, jwtVerify } from 'jose';
export const COOKIE = 'session';
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? '');

export async function createSession() {
  return new SignJWT({ sub: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
}
export async function verifySession(token?: string) {
  if (!token || !process.env.SESSION_SECRET) return false;
  try { await jwtVerify(token, key()); return true; } catch { return false; }
}
