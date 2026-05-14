"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const projects = [
  { id: "nodr",     name: "Nodr",      category: "product",  bg: "#3D4EC6", image: "/assets/work/nodr.png"     },
  { id: "conclude", name: "conclude.", category: "product",  bg: "#6B45A8", image: "/assets/work/conclude.png" },
  { id: "inook",    name: "Inook",     category: "product",  bg: "#F0784A", image: "/assets/work/inook.png"    },
  { id: "kintsugi", name: "kintsugi",  category: "research", bg: "#2D5C3E", image: "/assets/work/kintsugi.png" },
];

const filters = ["all", "product", "engineering", "research"];

function useTypewriter(text: string, speed = 45, startDelay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setDisplayed(""); setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay, enabled]);
  return { displayed, done };
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function BubbleCursor() {
  useEffect(() => {
    const colors = ["#F5A520", "#f5d020", "#f5c842", "#ffb347", "#ffa500"];
    const createBubble = (x: number, y: number) => {
      const bubble = document.createElement("div");
      const size = Math.random() * 20 + 8;
      bubble.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: transparent;
        border: 2px solid ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 99999;
        transition: transform 0.8s ease, opacity 0.8s ease;
        opacity: 0.8;
      `;
      document.body.appendChild(bubble);
      requestAnimationFrame(() => {
        bubble.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-Math.random() * 80 - 20}px) scale(0.2)`;
        bubble.style.opacity = "0";
      });
      setTimeout(() => bubble.remove(), 800);
    };
    const onMove = (e: MouseEvent) => createBubble(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return null;
}

function Grain() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: "-20%", pointerEvents: "none", zIndex: 9997, opacity: 0.04,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "180px 180px",
      animation: "grain 0.35s steps(1) infinite",
    }} />
  );
}

function TV() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [channel, setChannel] = useState(0);
  const [showStatic, setShowStatic] = useState(false);

  const drawStatic = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 210;
    }
    ctx.putImageData(img, 0, 0);
    rafRef.current = requestAnimationFrame(drawStatic);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setShowStatic(true);
      setTimeout(() => { setChannel(c => (c + 1) % projects.length); setShowStatic(false); }, 380);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (showStatic) { drawStatic(); }
    else { cancelAnimationFrame(rafRef.current); }
    return () => cancelAnimationFrame(rafRef.current);
  }, [showStatic, drawStatic]);

  return (
    <div style={{ position: "relative", width: 260, height: 200, margin: "0 auto 40px" }}>
      <div style={{
        position: "absolute", top: "17%", left: "13%", width: "59%", height: "54%",
        background: "#0a0a0a", overflow: "hidden", borderRadius: "3px",
      }}>
        <img src={projects[channel].image} alt={projects[channel].name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: showStatic ? 0 : 1, transition: "opacity 0.08s" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <canvas ref={canvasRef} width={156} height={108}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: showStatic ? "block" : "none" }}
        />
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.13) 2px, rgba(0,0,0,0.13) 4px)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
      </div>
      <img src="/assets/tv-frame.png" alt="Retro TV"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

function ScrambleLink({ href, label }: { href: string; label: string }) {
  const [text, setText] = useState(label);
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const scramble = () => {
    let step = 0;
    const iv = setInterval(() => {
      setText(label.split("").map((c, idx) => idx < step ? c : chars[Math.floor(Math.random() * chars.length)]).join(""));
      step++;
      if (step > label.length) { clearInterval(iv); setText(label); }
    }, 35);
  };
  return <Link href={href} style={styles.navLink} onMouseEnter={scramble}>{text}</Link>;
}

function TiltCard({ project }: { project: typeof projects[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 18, y: ((e.clientY - r.top) / r.height - 0.5) * -18 });
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ perspective: "800px", borderRadius: "10px" }}>
      <Link href={`/work/${project.id}`} style={{
        ...styles.card,
        transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.45s ease" : "transform 0.08s ease",
      }}>
        <div style={{ ...styles.cardInner, background: project.bg }}>
          <img src={project.image} alt={project.name} style={styles.cardImg}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 6px)" }} />
        </div>
      </Link>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const line1 = useTypewriter("hi! i'm rhea,", 48, 300);
  const line2 = useTypewriter("a product designer based in london", 40, 0, line1.done);
  const filtered = activeFilter === "all" ? projects : projects.filter(p => p.category === activeFilter);

  return (
    <>
      <Grain />
      <BubbleCursor />

      <nav style={styles.nav}>
        <Link href="/" style={styles.logoLink}>
          <img src="/assets/goldfish.png" alt="home" width={34} height={30} style={{ objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </Link>
        <div style={styles.navLinks}>
          {(["work", "about", "etc", "pdf"] as const).map(l => <ScrambleLink key={l} href={`/${l}`} label={l} />)}
        </div>
      </nav>

      <main style={styles.main}>
        <section style={styles.hero}>
          <TV />
          <h1 style={styles.heroHeading}>
            {line1.displayed}
            {!line1.done && <span style={styles.cursor}>▋</span>}
            {line1.done && (<><br />{line2.displayed}{!line2.done && <span style={styles.cursor}>▋</span>}</>)}
          </h1>
          {line2.done && (
            <p style={{ ...styles.heroBio, animation: "fadeIn 0.7s ease forwards" }}>
              Currently @ Bending Spoons<br />
              MEng Design Engineering @ Imperial College London<br />
              Previously @ Apple, Autodesk<span style={styles.blink}>▋</span>
            </p>
          )}
        </section>

        <Reveal>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <img src="/assets/icon-work.png" alt="" width={26} height={26} style={{ objectFit: "contain" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <h2 style={styles.sectionTitle}>check out my work</h2>
            </div>
            <div style={styles.filterRow}>
              {filters.map((f, i) => (
                <span key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => setActiveFilter(f)} style={{ ...styles.filterBtn, ...(activeFilter === f ? styles.filterActive : {}) }}>{f}</button>
                  {i < filters.length - 1 && <span style={styles.sep}>/</span>}
                </span>
              ))}
            </div>
            <div style={styles.arrow}>↑</div>
            <div style={styles.grid}>
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={i * 75}><TiltCard project={p} /></Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={80}>
          <section style={styles.aboutSection}>
            <Link href="/about" style={styles.arrowLink}>→ see more about me</Link>
            <Link href="/etc" style={styles.arrowLink}>→ and my passions</Link>
          </section>
        </Reveal>

        <Reveal delay={80}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <img src="/assets/icon-guestbook.png" alt="" width={26} height={26} style={{ objectFit: "contain" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <h2 style={styles.sectionTitle}>guestbook</h2>
            </div>
          </section>
        </Reveal>
      </main>

      <footer style={styles.footer}>
        <img src="/assets/goldfish.png" alt="" width={34} height={30} style={{ objectFit: "contain" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <span style={styles.footerText}>© Rhea 2026</span>
      </footer>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", position: "sticky", top: 0, background: "rgba(244,239,230,0.88)", backdropFilter: "blur(10px)", zIndex: 100 },
  logoLink: { display: "flex", alignItems: "center" },
  navLinks: { display: "flex", gap: "28px" },
  navLink: { fontSize: "14px", color: "var(--text)", fontFamily: "var(--font)", letterSpacing: "0.02em" },
  main: { maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 24px 100px", width: "100%" },
  hero: { marginTop: "36px", marginBottom: "88px" },
  heroHeading: { fontSize: "18px", fontWeight: 400, fontFamily: "var(--font)", lineHeight: 1.55, marginBottom: "14px", minHeight: "3.2em" },
  cursor: { display: "inline-block", animation: "blink 0.65s step-end infinite", color: "var(--accent)" },
  blink: { display: "inline-block", animation: "blink 0.65s step-end infinite", color: "var(--accent)", fontSize: "11px", marginLeft: "2px" },
  heroBio: { fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.85 },
  section: { marginBottom: "76px" },
  sectionHeader: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "18px" },
  sectionTitle: { fontSize: "15px", fontWeight: 400, fontFamily: "var(--font)", letterSpacing: "0.02em" },
  filterRow: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" },
  sep: { color: "var(--text-muted)", fontSize: "13px" },
  filterBtn: { background: "none", border: "none", fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-muted)", padding: 0 },
  filterActive: { color: "var(--text)", textDecoration: "underline", textUnderlineOffset: "3px" },
  arrow: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  card: { borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "1 / 0.85", display: "block", transformStyle: "preserve-3d" },
  cardInner: { width: "100%", height: "100%", position: "relative" },
  cardImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } as React.CSSProperties,
  aboutSection: { marginBottom: "76px", display: "flex", flexDirection: "column", gap: "10px" },
  arrowLink: { fontSize: "14px", color: "var(--text)" },
  footer: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px", borderTop: "1px solid var(--border)" },
  footerText: { fontSize: "12px", color: "var(--text-muted)" },
};