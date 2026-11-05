import { z } from 'zod';
const url = z.string().url().max(300);
export const ContentSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(120),
  summary: z.string().max(600),
  links: z.array(z.object({ label: z.string().max(40), url })).max(8),
  projects: z.array(z.object({
    title: z.string().max(100), year: z.string().max(10), description: z.string().max(800),
    stack: z.array(z.string().max(30)).max(15), url: url.optional(), repo: url.optional(), image: url.optional(),
  })).max(30),
  experience: z.array(z.object({
    org: z.string().max(100), role: z.string().max(100), period: z.string().max(40),
    points: z.array(z.string().max(300)).max(8),
  })).max(15),
  skills: z.array(z.object({ group: z.string().max(40), items: z.array(z.string().max(40)).max(30) })).max(10),
  achievements: z.array(z.object({ title: z.string().max(120), detail: z.string().max(300), year: z.string().max(10) })).max(20),
});
export type Content = z.infer<typeof ContentSchema>;
