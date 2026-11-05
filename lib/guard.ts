import { cookies } from 'next/headers';
import { COOKIE, verifySession } from './auth';
// Second check inside handlers, in addition to middleware.
export async function isAdmin() { return verifySession((await cookies()).get(COOKIE)?.value); }
