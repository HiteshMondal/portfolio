import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { listMessages } from '@/lib/rds';
import { isAdmin } from '@/lib/guard';
import Editor from './Editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function Admin() {
  if (!(await isAdmin())) redirect('/admin/login');
  const [content, messages] = await Promise.all([getContent(), listMessages().catch(() => null)]);
  return (
    <div className="admin">
      <Editor initial={JSON.stringify(content, null, 2)} />
      <h2 style={{ marginTop: 48 }}>Messages</h2>
      {messages === null && <p className="note">Messages are unavailable. Check the database connection in CloudWatch Logs.</p>}
      {messages?.length === 0 && <p className="note">No messages yet.</p>}
      {messages?.map((m) => (
        <div className="msg" key={m.id}>
          <strong>{m.name}</strong> <a href={`mailto:${m.email}`}>{m.email}</a> <span className="note">{new Date(m.created_at).toLocaleString()}</span>
          <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0' }}>{m.body}</p>
        </div>
      ))}
    </div>
  );
}
