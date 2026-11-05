import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { s3 } from '@/lib/aws';
import { isAdmin } from '@/lib/guard';

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = z.object({ contentType: z.string(), size: z.number().int().positive().max(5_000_000) }).safeParse(await req.json().catch(() => null));
  if (!b.success || !EXT[b.data.contentType]) return NextResponse.json({ error: 'Use a PNG, JPEG or WebP image under 5 MB.' }, { status: 400 });
  const Key = `uploads/${randomUUID()}.${EXT[b.data.contentType]}`;
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key, ContentType: b.data.contentType, ContentLength: b.data.size }), { expiresIn: 60 });
  return NextResponse.json({ uploadUrl, url: `${process.env.ASSET_BASE_URL}/${Key}` });
}
