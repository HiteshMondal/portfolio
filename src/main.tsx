import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent as RME, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { P, ROLES, SUMMARY, SKILLS, JOB, PROJ, ACH, EDU, CERTS, LANGS, HOBBIES } from "./data";
import RES from "./resumes.gen.json";

type Res = { label: string; filename: string; pdf: string; pages: string[] };
const NAV = ["about", "skills", "experience", "projects", "achievements", "education", "resume", "contact"];
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
const st = (i: number) => ({ "--i": i } as CSSProperties);
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function tilt(e: RME<HTMLElement>, max = 5) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", px * r.width + "px"); el.style.setProperty("--my", py * r.height + "px");
  el.style.setProperty("--ry", (px - 0.5) * max * 2 + "deg"); el.style.setProperty("--rx", (0.5 - py) * max * 2 + "deg");
}
const untilt = (e: RME<HTMLElement>) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };

function Net() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, col = "#ffd23f";
    const m = { x: -999, y: -999 };
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const still = reduced();
    const size = () => {
      const d = devicePixelRatio || 1; w = innerWidth; h = innerHeight;
      c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0);
      pts = Array.from({ length: Math.min(80, Math.floor((w * h) / 20000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 }));
    };
    const tint = () => { col = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || col; };
    const draw = () => {
      x.clearRect(0, 0, w, h); x.fillStyle = col; x.strokeStyle = col;
      for (const p of pts) {
        if (!still) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
        x.globalAlpha = 0.7; x.beginPath(); x.arc(p.x, p.y, 1.6, 0, 6.3); x.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 130) { x.globalAlpha = (1 - d / 130) * 0.35; x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y); x.stroke(); }
        }
        const dm = Math.hypot(pts[i].x - m.x, pts[i].y - m.y);
        if (dm < 180) { x.globalAlpha = (1 - dm / 180) * 0.7; x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(m.x, m.y); x.stroke(); }
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    const mv = (e: MouseEvent) => { m.x = e.clientX; m.y = e.clientY; };
    size(); tint(); draw();
    const ti = setInterval(tint, 1000);
    addEventListener("resize", size); addEventListener("mousemove", mv);
    return () => { cancelAnimationFrame(raf); clearInterval(ti); removeEventListener("resize", size); removeEventListener("mousemove", mv); };
  }, []);
  return <canvas ref={ref} className="net" aria-hidden="true" />;
}

const LINES: [string, string?][] = [
  ["whoami", "c"], ["hitesh-mondal · cloud & devops engineer in the making"], ["kubectl get pods -n hitesh", "c"],
  ["NAME            READY   STATUS"], ["aws-devops      1/1     Running", "ok"], ["terraform-iac   1/1     Running", "ok"],
  ["gitops-argocd   1/1     Running", "ok"], ["linux-admin     1/1     Running", "ok"], ["observability   1/1     Running", "ok"],
  ["open-to-work --relocate", "c"],
];
function Term() {
  const [n, setN] = useState(reduced() ? LINES.length : 0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v < LINES.length ? v + 1 : v)), 520);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="term tl" onMouseMove={(e) => tilt(e, 7)} onMouseLeave={untilt} role="img" aria-label="Terminal listing running pods: AWS, Terraform, GitOps, Linux and observability">
      <div className="bar"><i /><i /><i /><span>hitesh@cluster:~</span></div>
      <pre>
        {LINES.slice(0, n).map(([t, k], i) => (
          <div key={i}>{k === "c" && <span className="pr">$ </span>}{k === "ok" ? <>{t.slice(0, -7)}<span className="ok">Running</span></> : t}</div>
        ))}
        <span className="cur" />
      </pre>
    </div>
  );
}

function Count({ to, suffix }: { to: number; suffix: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

const Rv = ({ children, i = 0, cls = "" }: { children: ReactNode; i?: number; cls?: string }) => <div className={"rv " + cls} style={st(i)}>{children}</div>;
const Card = ({ children, cls = "" }: { children: ReactNode; cls?: string }) => <div className={"card tl " + cls} onMouseMove={(e) => tilt(e, 3)} onMouseLeave={untilt}>{children}</div>;
const Chips = ({ items }: { items: string[] }) => <>{items.map((x, k) => <span className="chip" key={x} style={{ "--k": k } as CSSProperties}>{x}</span>)}</>;
const Pts = ({ items }: { items: string[] }) => <ul className="pts">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
const Sec = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="sec"><h2 className="rv hd">{title}</h2><div>{children}</div></section>
);
const Word = ({ t, o }: { t: string; o: number }) => <span className="word" aria-hidden="true">{[...t].map((c, i) => <span className="ch" key={i} style={st(i + o)}>{c}</span>)}</span>;
function Marquee({ items, rev }: { items: string[]; rev?: boolean }) {
  return <div className="mq" aria-hidden="true"><div className={"mt" + (rev ? " rev" : "")}>{[...items, ...items].map((x, i) => <span key={i}>{x}</span>)}</div></div>;
}

function Viewer() {
  const list = RES as Res[];
  const [i, setI] = useState(0), [z, setZ] = useState(100), [msg, setMsg] = useState("");
  const r = list[i];
  if (!r) return <p className="muted">No resume has been added yet.</p>;
  const dl = async () => {
    try {
      const c = (window as unknown as { claude?: { use: (n: string) => Promise<{ save: (o: { filename: string; data: Blob }) => Promise<unknown> } | null> } }).claude;
      const d = c ? await c.use("downloads") : null;
      if (!d) { setMsg("Downloads aren’t available in this view. Open the published link in a browser to save the PDF."); return; }
      const bin = atob(r.pdf), u = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
      await d.save({ filename: r.filename, data: new Blob([u], { type: "application/pdf" }) });
      setMsg("Saved " + r.filename);
    } catch (e) { setMsg((e as { code?: string }).code === "declined" ? "" : "Couldn’t save the PDF. Please try again."); }
  };
  return (
    <div className="pdf">
      <div className="pbar">
        {list.length > 1 && <div className="tabs" role="tablist">{list.map((x, k) => <button key={x.label} role="tab" aria-selected={k === i} className={"tab" + (k === i ? " on" : "")} onClick={() => setI(k)}>{x.label}</button>)}</div>}
        <span className="fn">{r.filename}</span>
        <div className="zoom"><button aria-label="Zoom out" onClick={() => setZ(Math.max(60, z - 20))}>−</button><span>{z}%</span><button aria-label="Zoom in" onClick={() => setZ(Math.min(160, z + 20))}>+</button></div>
        <button className="btn p" onClick={dl}>Download PDF</button>
      </div>
      <div className="pview" tabIndex={0} aria-label={r.label + " PDF, scrollable"}>
        {r.pages.map((src, k) => <img key={i + "-" + k} className="pg" src={src} style={{ ...st(k), width: z + "%" }} alt={`${r.label}, page ${k + 1} of ${r.pages.length}`} />)}
      </div>
      <p className="note" role="status">{msg || `PDF · ${r.pages.length} pages`}</p>
    </div>
  );
}

function Contact() {
  const [msg, setMsg] = useState("");
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), name = String(f.get("name")), from = String(f.get("email")), body = String(f.get("msg"));
    const url = `mailto:${P.email}?subject=${encodeURIComponent("Hello from " + name)}&body=${encodeURIComponent(body + "\n\n" + name + " (" + from + ")")}`;
    setMsg("Opening your email app. If nothing opens, copy my address and write to me directly.");
    window.location.href = url;
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(P.email); setMsg("Email address copied."); }
    catch { setMsg("Couldn’t copy automatically. My address is " + P.email); }
  };
  return (
    <div className="contact">
      <Rv><form onSubmit={send} className="card">
        <label>Your name<input name="name" required autoComplete="name" /></label>
        <label>Your email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Message<textarea name="msg" rows={5} required /></label>
        <button className="btn p" type="submit">Send message</button>
        <p className="note" role="status">{msg}</p>
      </form></Rv>
      <Rv i={1}><div className="links">
        <a className="btn" href={"mailto:" + P.email}>{P.email}</a>
        <button className="btn" onClick={copy}>Copy email address</button>
        <a className="btn" href={"tel:" + P.tel}>{P.phone}</a>
        <a className="btn" href={P.li} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a className="btn" href={P.gh} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a className="btn" href={P.lc} target="_blank" rel="noopener noreferrer">LeetCode</a>
        <p className="muted">Based in {P.loc}. Permanent address: {P.perm}. Open to relocate.</p>
      </div></Rv>
    </div>
  );
}

function App() {
  const [r, setR] = useState(0), [act, setAct] = useState("");
  const glow = useRef<HTMLDivElement>(null), prog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setR((v) => (v + 1) % ROLES.length), 2400);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setAct(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((id) => { const el = document.getElementById(id); if (el) so.observe(el); });
    const mm = (e: MouseEvent) => { if (glow.current) glow.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; };
    const sc = () => { const mx = document.documentElement.scrollHeight - innerHeight; if (prog.current) prog.current.style.transform = `scaleX(${mx > 0 ? scrollY / mx : 0})`; };
    addEventListener("mousemove", mm); addEventListener("scroll", sc, { passive: true }); sc();
    return () => { clearInterval(t); io.disconnect(); so.disconnect(); removeEventListener("mousemove", mm); removeEventListener("scroll", sc); };
  }, []);
  const theme = () => {
    const el = document.documentElement;
    const light = el.dataset.theme ? el.dataset.theme === "light" : matchMedia("(prefers-color-scheme: light)").matches;
    el.dataset.theme = light ? "dark" : "light";
  };
  const tools = SKILLS[2][1];
  return (
    <>
      <div className="aur" aria-hidden="true"><i /><i /><i /></div>
      <Net />
      <div className="glow" ref={glow} aria-hidden="true" />
      <div className="prog" ref={prog} aria-hidden="true" />
      <header className="nav">
        <b className="logo">hitesh.dev</b>
        <nav aria-label="Sections">{NAV.map((s) => <button key={s} className={"lk" + (act === s ? " on" : "")} onClick={() => go(s)}>{s}</button>)}</nav>
        <button className="lk" onClick={theme} aria-label="Toggle light and dark theme">theme</button>
      </header>
      <main className="w">
        <section className="hero">
          <div>
            <p className="kick">Aspiring IT engineer · Hyderabad · open to relocate</p>
            <h1 aria-label="Hitesh Mondal"><Word t="Hitesh" o={0} /><br /><Word t="Mondal" o={6} /></h1>
            <p className="lead">I want to build, automate and run reliable systems. Right now that means <span className="swap" key={r}>{ROLES[r]}</span>.</p>
            <div className="cta">
              <button className="btn p" onClick={() => go("projects")}>See my projects</button>
              <button className="btn" onClick={() => go("resume")}>View resume</button>
              <button className="btn" onClick={() => go("contact")}>Contact me</button>
            </div>
          </div>
          <Term />
        </section>
        <Marquee items={tools.slice(0, 10)} />
        <Marquee items={[...tools.slice(10), ...SKILLS[0][1]]} rev />

        <Sec id="about" title="About">
          {SUMMARY.map((s, k) => <Rv i={k} key={s}><p className="body">{s}</p></Rv>)}
          <Rv i={3}><p className="muted"><b>Languages:</b> {LANGS}. <b>Outside work:</b> {HOBBIES}.</p></Rv>
        </Sec>

        <Sec id="skills" title="Skills">
          {SKILLS.map(([k, v], n) => (
            <Rv i={n} key={k}><Card cls="sk"><h3>{k}</h3><div><Chips items={v} /></div></Card></Rv>
          ))}
        </Sec>

        <Sec id="experience" title="Experience">
          <Rv><Card>
            <div className="head"><h3>{JOB.role}</h3><span className="muted">{JOB.when}</span></div>
            <p className="muted">{JOB.org}, {JOB.place}</p>
            <Pts items={JOB.pts} />
          </Card></Rv>
        </Sec>

        <Sec id="projects" title="Projects">
          {PROJ.map((p) => (
            <Rv key={p.name}><Card cls="proj">
              <div className="head"><h3>{p.name}</h3><span className="muted">{p.when}</span></div>
              <div className="mini">{p.stats.map(([a, b]) => <div key={b}><strong>{a}</strong><span>{b}</span></div>)}</div>
              <Pts items={p.pts} />
              <div><Chips items={p.stack} /></div>
              <a className="btn" href={"https://" + p.repo} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </Card></Rv>
          ))}
        </Sec>

        <Sec id="achievements" title="Achievements">
          <div className="stats">
            {ACH.map((a, k) => (
              <Rv i={k} key={a.t}><Card>
                <strong className="big">{a.n === null ? a.s : <Count to={a.n} suffix={a.s} />}</strong>
                <p>{a.t}</p><p className="muted">{a.src}</p>
              </Card></Rv>
            ))}
          </div>
        </Sec>

        <Sec id="education" title="Education and certifications">
          {EDU.map(([a, b, c], k) => <Rv i={k} key={a}><div className="row"><span>{c}</span><div><b>{a}</b><p className="muted">{b}</p></div></div></Rv>)}
          {CERTS.map(([a, b], k) => <Rv i={k} key={a}><div className="row"><span>{b}</span><div>{a}</div></div></Rv>)}
        </Sec>

        <Sec id="resume" title="Resume"><Rv><Viewer /></Rv></Sec>
        <Sec id="contact" title="Contact"><Contact /></Sec>
      </main>
      <footer className="foot">© 2026 Hitesh Mondal · Built with React and TypeScript</footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
