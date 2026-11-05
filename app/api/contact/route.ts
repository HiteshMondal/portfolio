import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveMessage } from '@/lib/rds';
import { ipOf, limited } from '@/lib/rate';
import { log, metric } from '@/lib/log';

const Schema = z.object({ name: z.string().trim().min(1).max(100), email: z.string().email().max(200), message: z.string().trim().min(5).max(3000), website: z.string().optional() });

export async function POST(req: Request) {
  if (limited(`contact:${ipOf(req)}`, 5, 3600_000)) return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429 });
  const p = Schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Check your name, email and message and try again.' }, { status: 400 });
  if (p.data.website) return NextResponse.json({ ok: true }); // honeypot: silently drop bots
  try {
    await saveMessage({ name: p.data.name, email: p.data.email, body: p.data.message });
    metric('ContactSubmitted');
    return NextResponse.json({ ok: true });
  } catch (e) {
    log('error', 'contact_save_failed', { err: String(e) });
    metric('ContactFailed');
    return NextResponse.json({ error: 'Your message could not be sent. Please email me directly.' }, { status: 500 });
  }
}
