import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ContentSchema } from '@/lib/types';
import { saveContent } from '@/lib/content';
import { isAdmin } from '@/lib/guard';
import { log } from '@/lib/log';

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = ContentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const error = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return NextResponse.json({ error }, { status: 400 });
  }
  await saveContent(parsed.data);
  revalidatePath('/');
  log('info', 'content_saved');
  return NextResponse.json({ ok: true });
}
