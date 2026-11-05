'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setNote('');
    const f = e.currentTarget;
    const d = Object.fromEntries(new FormData(f));
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { f.reset(); setNote('Message sent. I will reply by email.'); } else setNote(j.error ?? 'Your message could not be sent.');
  }
  return (
    <form className="card" onSubmit={submit}>
      <label>Name<input name="name" required maxLength={100} autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
      <label>Message<textarea name="message" required minLength={5} maxLength={3000} rows={5} /></label>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      <div className="note" role="status">{note}</div>
    </form>
  );
}
