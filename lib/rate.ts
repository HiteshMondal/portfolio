// Per-task in-memory limiter: a first line of defence, not a distributed one.
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}
// The ALB appends the real client IP last; earlier entries can be spoofed.
export const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ?? 'unknown';
