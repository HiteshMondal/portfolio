'use client';
import { useState } from 'react';

export default function Login() {
  const [note, setNote] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    if (r.ok) location.href = '/admin'; else setNote((await r.json().catch(() => ({}))).error ?? 'Sign-in failed.');
  }
  return (
    <div className="admin" style={{ maxWidth: 420 }}>
      <meta name="robots" content="noindex" />
      <h1>Sign in</h1>
      <form className="card" onSubmit={submit}>
        <label>Email<input name="email" type="email" required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button>Sign in</button>
        <div className="note" role="alert">{note}</div>
      </form>
    </div>
  );
}
