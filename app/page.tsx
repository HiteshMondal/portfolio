import { getContent } from '@/lib/content';
import ContactForm from './ContactForm';

export const revalidate = 60;

export default async function Home() {
  const c = await getContent();
  const nav = [c.projects.length && ['projects', 'Projects'], c.experience.length && ['experience', 'Experience'], c.skills.length && ['skills', 'Skills'], c.achievements.length && ['achievements', 'Achievements'], ['contact', 'Contact']].filter(Boolean) as string[][];
  return (
    <div className="shell">
      <aside className="rail">
        <h1>{c.name}</h1>
        <p className="role">{c.role}</p>
        <p>{c.summary}</p>
        <nav aria-label="Sections">{nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
        {c.links.length > 0 && <div className="ext">{c.links.map((l) => <a key={l.url} href={l.url} rel="noopener noreferrer">{l.label}</a>)}</div>}
      </aside>
      <main>
        {c.projects.length > 0 && <section id="projects"><h2>Projects</h2>{c.projects.map((p) => (
          <article className="row" key={p.title}>
            <span className="meta">{p.year}</span>
            <div>
              <h3>{p.title}</h3><p>{p.description}</p>
              <div className="stack">{p.stack.join(', ')}</div>
              {(p.url || p.repo) && <div className="links">{p.url && <a href={p.url} rel="noopener noreferrer">Live site</a>}{p.repo && <a href={p.repo} rel="noopener noreferrer">Source</a>}</div>}
              {p.image && <img src={p.image} alt={`Screenshot of ${p.title}`} loading="lazy" />}
            </div>
          </article>))}</section>}
        {c.experience.length > 0 && <section id="experience"><h2>Experience</h2>{c.experience.map((e) => (
          <article className="row" key={e.org + e.period}>
            <span className="meta">{e.period}</span>
            <div><h3>{e.role}, {e.org}</h3><ul className="plain">{e.points.map((pt) => <li key={pt}>{pt}</li>)}</ul></div>
          </article>))}</section>}
        {c.skills.length > 0 && <section id="skills"><h2>Skills</h2><dl className="skills">{c.skills.map((s) => <div key={s.group}><dt>{s.group}</dt><dd>{s.items.join(', ')}</dd></div>)}</dl></section>}
        {c.achievements.length > 0 && <section id="achievements"><h2>Achievements</h2>{c.achievements.map((a) => (
          <article className="row" key={a.title}><span className="meta">{a.year}</span><div><h3>{a.title}</h3><p>{a.detail}</p></div></article>))}</section>}
        <section id="contact"><h2>Contact</h2><ContactForm /></section>
      </main>
    </div>
  );
}
