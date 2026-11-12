import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RME, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { P, ROLES, SUMMARY, SKILLS, JOB, PROJ, ACH, EDU, CERTS, LANGS, HOBBIES } from "./data";
import RES from "./resumes.gen.json";

type Res = { label: string; filename: string; pdf: string; pages: string[] };
const DOTS: [string, string][] = [["top", "Intro"], ["story", "Story"], ["now", "Now"], ["work", "Projects"], ["wins", "Numbers"], ["path", "Path"], ["cv", "Resume"], ["hello", "Contact"]];
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
const st = (i: number) => ({ "--i": i } as CSSProperties);
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const KEY = /^(Cloud|Computing|DevOps|Platform|Engineering|Linux|Administration|DSA|OOP|DBMS|Computer|Networks|System|Design)\b/;

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

const IC: Record<string, [boolean, ReactNode]> = {
  mail: [false, <><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></>],
  phone: [false, <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />],
  gh: [true, <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />],
  li: [true, <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />],
  lc: [false, <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" /></>],
};
const Icon = ({ k }: { k: string }) => {
  const [filled, node] = IC[k];
  return filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{node}</svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{node}</svg>;
};

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

type Ln = { k: string; t: string; v: string; href: string; ext?: boolean };

function Contact() {
  const [msg, setMsg] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(P.email); setMsg("Email address copied."); }
    catch { setMsg("Couldn’t copy automatically. My address is " + P.email); }
  };
  const links: Ln[] = [
    { k: "mail", t: "Email", v: P.email, href: "mailto:" + P.email },
    { k: "phone", t: "Phone", v: P.phone, href: "tel:" + P.tel },
    { k: "gh", t: "GitHub", v: "@" + (P.gh.split("/").pop() ?? ""), href: P.gh, ext: true },
    { k: "li", t: "LinkedIn", v: P.li.split("/").pop() ?? "", href: P.li, ext: true },
    { k: "lc", t: "LeetCode", v: "@" + (P.lc.split("/").pop() ?? ""), href: P.lc, ext: true },
  ];
  return (
    <div className="contact">
      <Rv>
        <div className="cbox">
          <p className="lead2">Open to cloud, DevOps and Linux roles, and happy to relocate. Pick whichever way suits you best.</p>
          <div className="row">
            <a className="btn p" href={"mailto:" + P.email}>Email me</a>
            <button className="btn" onClick={copy}>Copy email address</button>
          </div>
          <p className="note" role="status">{msg}</p>
          <div className="tiles">
            {links.map((l, k) => (
              <div className="rv" style={st(k)} key={l.k}>
                <a className="tile" href={l.href} {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} onMouseMove={(e) => tilt(e, 0)}>
                  <span className="ic"><Icon k={l.k} /></span>
                  <small>{l.t}</small>
                  <b>{l.v}</b>
                  <span className="ar" aria-hidden="true">↗</span>
                </a>
              </div>
            ))}
          </div>
          <p className="muted loc">Based in {P.loc}. Permanent address: {P.perm}. Open to relocate.</p>
        </div>
      </Rv>
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
          <Rv><p className="eyebrow">About me</p></Rv>
          <p className="say">{SUMMARY[0].split(" ").map((w, i) => <span key={i} className={KEY.test(w) ? "k" : undefined}>{w} </span>)}</p>
          <div className="sgrid">
            <Rv><Card cls="sc">
              <span className="no">01</span>
              <h4>How I learn</h4>
              <p>{SUMMARY[1]}</p>
            </Card></Rv>
            <Rv i={1}><Card cls="sc">
              <span className="no">02</span>
              <h4>What I’m looking for</h4>
              <p>{SUMMARY[2]}</p>
            </Card></Rv>
            <Rv i={2}><Card cls="sc facts">
              <span className="no">03</span>
              <h4>At a glance</h4>
              <div className="fg"><h5>Focus</h5><Chips items={ROLES} /></div>
              <div className="fg"><h5>Languages</h5><Chips items={LANGS.split(", ")} /></div>
              <div className="fg"><h5>Off the clock</h5><Chips items={HOBBIES.split(", ").map(cap)} /></div>
            </Card></Rv>
          </div>
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