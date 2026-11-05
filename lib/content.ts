import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from './aws';
import { log } from './log';
import { Content, ContentSchema } from './types';

export const DEFAULT_CONTENT: Content = {
  name: 'Your Name',
  role: 'Software engineer',
  summary: 'Sign in at /admin to replace this placeholder with your own summary, projects, skills and achievements.',
  links: [],
  projects: [{ title: 'Example project', year: '2026', description: 'Describe the problem, your approach and the result.', stack: ['TypeScript', 'Next.js', 'AWS'] }],
  experience: [], skills: [{ group: 'Languages', items: ['TypeScript'] }], achievements: [],
};

const Key = { pk: 'SITE', sk: 'CONTENT' };

export async function getContent(): Promise<Content> {
  if (!process.env.TABLE_NAME) return DEFAULT_CONTENT;
  try {
    const { Item } = await ddb.send(new GetCommand({ TableName: process.env.TABLE_NAME, Key }));
    const parsed = ContentSchema.safeParse(Item?.data);
    return parsed.success ? parsed.data : DEFAULT_CONTENT;
  } catch (e) {
    log('error', 'content_read_failed', { err: String(e) });
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(data: Content) {
  await ddb.send(new PutCommand({ TableName: process.env.TABLE_NAME, Item: { ...Key, data, updatedAt: new Date().toISOString() } }));
}
