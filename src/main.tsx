import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent as RME, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { P, ROLES, SUMMARY, SKILLS, JOB, PROJ, ACH, EDU, CERTS, LANGS, HOBBIES } from "./data";
import RES from "./resumes.gen.json";

type Res = { label: string; filename: string; pdf: string; pages: string[] };
const DOTS: [string, string][] = [["top", "Intro"], ["story", "Story"], ["now", "Now"], ["work", "Projects"], ["wins", "Numbers"], ["path", "Path"], ["cv", "Resume"], ["hello", "Contact"]];
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
const st = (i: number) => ({ "--i": i } as CSSProperties);
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function tilt(e: RME<HTMLElement>, max = 4) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", px * r.width + "px"); el.style.setProperty("--my", py * r.height + "px");
  el.style.setProperty("--ry", (px - 0.5) * max * 2 + "deg"); el.style.setProperty("--rx", (0.5 - py) * max * 2 + "deg");
}
const untilt = (e: RME<HTMLElement>) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };
const burst = (x: number, y: number, n = 14) => {
  if (document.querySelectorAll(".sp").length > 120) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i"), a = Math.random() * 6.28, d = 40 + Math.random() * 90;
    s.className = "sp" + (i % 2 ? " b" : "");
    s.style.cssText = `--x:${x}px;--y:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    s.addEventListener("animationend", () => s.remove());
    document.body.appendChild(s);
  }
};

const Rv = ({ children, i = 0, cls = "" }: { children: ReactNode; i?: number; cls?: string }) => <div className={"rv " + cls} style={st(i)}>{children}</div>;
const Card = ({ children, cls = "" }: { children: ReactNode; cls?: string }) => <div className={"card " + cls} onMouseMove={(e) => tilt(e)} onMouseLeave={untilt}>{children}</div>;
const Chips = ({ items }: { items: string[] }) => <>{items.map((x) => <span className="chip" key={x}>{x}</span>)}</>;
const Pts = ({ items }: { items: string[] }) => <ul className="pts">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
const Word = ({ t, o }: { t: string; o: number }) => <span className="word" aria-hidden="true">{[...t].map((c, i) => <span className="ch" key={i} style={st(i + o)}>{c}</span>)}</span>;
const Band = ({ items, s, rev }: { items: string[]; s: number; rev?: boolean }) => (
  <div className="band" aria-hidden="true"><div className={"track" + (rev ? " rev" : "")} style={{ "--s": s + "s" } as CSSProperties}>{[...items, ...items].map((x, i) => <span className="pill" key={i}>{x}</span>)}</div></div>
);

function Orbit({ a, b }: { a: string[]; b: string[] }) {
  const ring = (items: string[], r: number, cls: string) => (
    <div className={"ring " + cls} style={{ "--r": r } as CSSProperties}>
      {items.map((x, k) => <div className="it" key={x} style={{ "--t": (360 / items.length) * k + "deg" } as CSSProperties}><span>{x}</span></div>)}
    </div>
  );
  return <div className="scene" aria-hidden="true"><div className="rig"><div className="orb" />{ring(a, 235, "r1")}{ring(b, 140, "r2 rev")}</div></div>;
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

function Viewer() {
  const list = RES as Res[];
  const [i, setI] = useState(0), [z, setZ] = useState(100), [msg, setMsg] = useState("");
  const r = list[i];
  if (!r) return <p className="muted">No resume has been added yet.</p>;
  const dl = async () => {
    try {
      const bin = atob(r.pdf), u = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
      const blob = new Blob([u], { type: "application/pdf" });
      const c = (window as unknown as { claude?: { use: (n: string) => Promise<{ save: (o: { filename: string; data: Blob }) => Promise<unknown> } | null> } }).claude;
      const d = c ? await c.use("downloads") : null;
      if (d) await d.save({ filename: r.filename, data: blob });
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = r.filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
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
        {r.pages.map((src, k) => <img key={i + "-" + k} className="pg" src={src} style={{ width: z + "%" }} alt={`${r.label}, page ${k + 1} of ${r.pages.length}`} />)}
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
  const [r, setR] = useState(0), [act, setAct] = useState("top");
  const glow = useRef<HTMLDivElement>(null), prog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const still = reduced(), root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".hero"), aur = document.querySelector<HTMLElement>(".aur"), say = document.querySelector(".say");
    const words = [...document.querySelectorAll(".say span")];
    const rot = setInterval(() => setR((v) => (v + 1) % ROLES.length), 2400);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setAct(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    DOTS.forEach(([id]) => { const el = document.getElementById(id); if (el) so.observe(el); });
    let tick = false, last: HTMLElement | null = null, pal = 0;
    const frame = () => {
      tick = false;
      const mx = root.scrollHeight - innerHeight;
      if (prog.current) prog.current.style.transform = `scaleX(${mx > 0 ? scrollY / mx : 0})`;
      aur?.style.setProperty("--sy", String(scrollY));
      if (say) {
        const b = say.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * 0.85 - b.top) / (b.height + innerHeight * 0.3)));
        words.forEach((w, i) => w.classList.toggle("on", still || i < p * words.length * 1.08));
      }
    };
    const sc = () => { if (!tick) { tick = true; requestAnimationFrame(frame); } };
    const move = (e: PointerEvent) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      hero?.style.setProperty("--px", String((e.clientX / innerWidth) * 2 - 1)); hero?.style.setProperty("--py", String((e.clientY / innerHeight) * 2 - 1));
      if (e.pointerType !== "mouse") return;
      const b = ((e.target as Element).closest?.(".btn,.nb") as HTMLElement | null) ?? null;
      if (last && last !== b) last.style.translate = "";
      if (b) { const k = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - k.left - k.width / 2) * 0.25}px ${(e.clientY - k.top - k.height / 2) * 0.35}px`; }
      last = b;
    };
    const down = (e: PointerEvent) => { if (!still && !(e.target as Element).closest?.("input,textarea")) burst(e.clientX, e.clientY); };
    const click = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.("[data-vibe]")) return;
      pal = (pal + 1) % 5;
      if (pal) root.dataset.pal = String(pal); else delete root.dataset.pal;
      if (!still) burst(e.clientX, e.clientY, 30);
    };
    addEventListener("scroll", sc, { passive: true }); addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true }); addEventListener("click", click); frame();
    return () => { clearInterval(rot); io.disconnect(); so.disconnect(); removeEventListener("scroll", sc); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("click", click); };
  }, []);
  const theme = () => {
    const el = document.documentElement;
    const light = el.dataset.theme ? el.dataset.theme === "light" : matchMedia("(prefers-color-scheme: light)").matches;
    el.dataset.theme = light ? "dark" : "light";
  };
  const all = SKILLS.flatMap(([, v]) => v), n = Math.ceil(all.length / 3);
  const tools = SKILLS[2][1];
  const path: [string, string, string?][] = [...EDU.map(([a, b, c]) => [c, a, b] as [string, string, string]), ...CERTS.map(([a, b]) => [b, a] as [string, string])];
  return (
    <>
      <div className="aur" aria-hidden="true"><i /><i /><i /></div>
      <div className="glow" ref={glow} aria-hidden="true" />
      <div className="prog" ref={prog} aria-hidden="true" />
      <header className="nav">
        <b className="logo gt">hitesh.dev</b>
        <button className="nb h" onClick={() => go("cv")}>Resume</button>
        <button className="nb" data-vibe aria-label="Change accent colors">✦ Vibe</button>
        <button className="nb" onClick={theme} aria-label="Toggle light and dark theme">Theme</button>
        <button className="nb p" onClick={() => go("hello")}>Say hi</button>
      </header>
      <nav className="dots" aria-label="Page sections">{DOTS.map(([id, t]) => <button key={id} className={act === id ? "on" : ""} data-t={t} aria-label={t} onClick={() => go(id)} />)}</nav>
      <main>
        <section id="top" className="w hero">
          <div>
            <p className="kick">Open to relocate · {P.loc.split(",")[1]?.trim() ?? "Hyderabad"}</p>
            <h1 aria-label="Hitesh Mondal"><Word t="Hitesh" o={0} /><br /><Word t="Mondal" o={6} /></h1>
            <p className="lead">I build, automate and run reliable systems. Right now that means <span className="swap" key={r}>{ROLES[r]}</span>.</p>
            <div className="cta">
              <button className="btn p" onClick={() => go("work")}>See what I’ve built</button>
              <button className="btn" onClick={() => go("hello")}>Let’s talk</button>
            </div>
          </div>
          <Orbit a={tools.slice(0, 12)} b={[...SKILLS[0][1].slice(0, 3), ...tools.slice(12, 17)]} />
        </section>

        <section id="story" className="w">
          <p className="say">{SUMMARY[0].split(" ").map((w, i) => <span key={i}>{w} </span>)}</p>
          <div className="cols"><Rv><p className="muted">{SUMMARY[1]}</p></Rv><Rv i={1}><p className="muted">{SUMMARY[2]}</p></Rv></div>
          <Rv><p className="muted">I speak {LANGS}. Off the clock: {HOBBIES}.</p></Rv>
        </section>

        <div className="bands" aria-hidden="true">
          <Band items={all.slice(0, n)} s={42} /><Band items={all.slice(n, 2 * n)} s={50} rev /><Band items={all.slice(2 * n)} s={38} />
        </div>
        <ul className="sr">{all.map((x) => <li key={x}>{x}</li>)}</ul>

        <section id="now" className="w now">
          <Rv>
            <p className="live"><i />Right now</p>
            <h2><span className="gt">{JOB.role}</span> at {JOB.org}</h2>
            <p className="muted">{JOB.place} · {JOB.when}</p>
          </Rv>
          <Rv i={1}><Card><Pts items={JOB.pts} /></Card></Rv>
        </section>

        <section id="work" className="w">
          {PROJ.map((p) => (
            <Rv key={p.name}><Card cls="proj">
              <span className="muted">{p.when}</span>
              <h3>{p.name}</h3>
              <div className="mini">{p.stats.map(([a, b]) => <div key={b}><strong>{a}</strong><span>{b}</span></div>)}</div>
              <Pts items={p.pts} />
              <div><Chips items={p.stack} /></div>
              <a className="btn" href={"https://" + p.repo} target="_blank" rel="noopener noreferrer">View on GitHub →</a>
            </Card></Rv>
          ))}
        </section>

        <section id="wins" className="w">
          <div className="bento">
            {ACH.map((a, k) => (
              <Rv i={k % 4} key={a.t}><Card>
                <strong className="big">{a.n === null ? a.s : <Count to={a.n} suffix={a.s} />}</strong>
                <p>{a.t}</p><p className="muted">{a.src}</p>
              </Card></Rv>
            ))}
          </div>
        </section>

        <section id="path" className="w">
          <div className="rv tl2">
            {path.map(([w, t, s]) => <div className="ev" key={t}><span className="muted">{w}</span><b>{t}</b>{s && <p className="muted">{s}</p>}</div>)}
          </div>
        </section>

        <section id="cv" className="w"><Rv><Viewer /></Rv></section>

        <section id="hello" className="w">
          <Rv><h2 className="mega gt">Let’s build something reliable.</h2></Rv>
          <Contact />
        </section>
      </main>
      <footer className="foot">© 2026 Hitesh Mondal · Built with React and TypeScript</footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);