import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { COOKIE, createSession } from '@/lib/auth';
import { ipOf, limited } from '@/lib/rate';
import { log, metric } from '@/lib/log';

export async function POST(req: Request) {
  const ip = ipOf(req);
  if (limited(`login:${ip}`, 8, 15 * 60_000)) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  const body = z.object({ email: z.string(), password: z.string().max(200) }).safeParse(await req.json().catch(() => null));
  const hash = process.env.ADMIN_PASSWORD_HASH ?? '';
  // Always run the comparison so timing doesn't reveal whether the email matched.
  const passOk = body.success && hash ? await bcrypt.compare(body.data.password, hash) : false;
  const ok = passOk && body.success && body.data.email.toLowerCase() === (process.env.ADMIN_EMAIL ?? '').toLowerCase();
  if (!ok) { metric('LoginFailed'); log('warn', 'login_failed', { ip }); return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 7 * 86400 });
  log('info', 'login_ok', { ip });
  return res;
}
