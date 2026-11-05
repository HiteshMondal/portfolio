'use client';
import { useState } from 'react';

export default function Editor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState('');
  const [assetUrl, setAssetUrl] = useState('');

  async function save() {
    let body: unknown;
    try { body = JSON.parse(text); } catch { return setStatus('Invalid JSON. Fix the syntax and save again.'); }
    setStatus('Saving…');
    const r = await fetch('/api/admin/content', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setStatus(r.ok ? 'Saved. The public site updates within a minute.' : `Not saved. ${j.error ?? r.status}`);
  }
  async function upload(file: File) {
    setStatus('Uploading…');
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contentType: file.type, size: file.size }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setStatus(j.error ?? 'Upload failed.');
    const put = await fetch(j.uploadUrl, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
    if (put.ok) { setAssetUrl(j.url); setStatus('Uploaded. Paste the URL into a project’s "image" field.'); } else setStatus('Upload to S3 failed.');
  }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/admin/login'; }

  return (
    <>
      <h1>Edit portfolio</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label="Portfolio content as JSON" />
      <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={save}>Save changes</button>
        <button onClick={logout} style={{ background: 'var(--ink)' }}>Sign out</button>
        <a href="/" target="_blank">View site</a>
      </p>
      <label>Upload image (PNG, JPEG, WebP, up to 5 MB)
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {assetUrl && <p className="note"><code>{assetUrl}</code></p>}
      <div className="note" role="status">{status}</div>
    </>
  );
}
