"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const projects = [
  {
    id: "nodr",
    name: "Nodr",
    category: "product",
    bg: "#3D4EC6",
    href: "/work/nodr",
    image: "/assets/work/nodr.png",
  },
  {
    id: "conclude",
    name: "conclude.",
    category: "product",
    bg: "#6B45A8",
    href: "/work/conclude",
    image: "/assets/work/conclude.png",
  },
  {
    id: "inook",
    name: "Inook",
    category: "product",
    bg: "#F0784A",
    href: "/work/inook",
    image: "/assets/work/inook.png",
  },
  {
    id: "kintsugi",
    name: "kintsugi",
    category: "research",
    bg: "#2D5C3E",
    href: "/work/kintsugi",
    image: "/assets/work/kintsugi.png",
  },
];

const filters = ["all", "product", "engineering", "research"];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <Link href="/" style={styles.logoLink}>
          {/* swap for your goldfish asset once added to /public/assets/ */}
          <Goldfish />
        </Link>
        <div style={styles.navLinks}>
          <Link href="/work" style={styles.navLink}>work</Link>
          <Link href="/about" style={styles.navLink}>about</Link>
          <Link href="/etc" style={styles.navLink}>etc</Link>
          <Link href="/pdf" style={styles.navLink}>pdf</Link>
        </div>
      </nav>

      <main style={styles.main}>

        {/* ── Hero ── */}
        <section style={styles.hero}>
          <div style={styles.tvWrap}>
            {/* swap /assets/tv-hero.png for your actual TV image */}
            <img
              src="/assets/tv-hero.png"
              alt="Retro TV"
              style={styles.tvImg}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Fallback placeholder shown until image is added */}
            <TvPlaceholder />
          </div>

          <h1 style={styles.heroHeading}>
            hi! i&apos;m rhea,<br />
            a product designer based in london
          </h1>
          <p style={styles.heroBio}>
            Currently @ Bending Spoons<br />
            MEng Design Engineering @ Imperial College London<br />
            Previously @ Apple, Autodesk
          </p>
        </section>

        {/* ── Work ── */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📋</span>
            <h2 style={styles.sectionTitle}>check out my work</h2>
          </div>

          {/* Filter */}
          <div style={styles.filterRow}>
            {filters.map((f, i) => (
              <span key={f} style={styles.filterItem}>
                <button
                  onClick={() => setActiveFilter(f)}
                  style={{
                    ...styles.filterBtn,
                    ...(activeFilter === f ? styles.filterBtnActive : {}),
                  }}
                >
                  {f}
                </button>
                {i < filters.length - 1 && (
                  <span style={styles.filterSep}>/</span>
                )}
              </span>
            ))}
          </div>
          <div style={styles.filterArrow}>↑</div>

          {/* Grid */}
          <div style={styles.grid}>
            {filtered.map((project) => (
              <Link key={project.id} href={project.href} style={styles.card}>
                <div
                  style={{
                    ...styles.cardInner,
                    background: project.bg,
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    style={styles.cardImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── About teaser ── */}
        <section style={styles.aboutSection}>
          <Link href="/about" style={styles.arrowLink}>
            → see more about me
          </Link>
          <Link href="/etc" style={styles.arrowLink}>
            → and my passions
          </Link>
        </section>

        {/* ── Guestbook ── */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🖊️</span>
            <h2 style={styles.sectionTitle}>guestbook</h2>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <Goldfish />
        <span style={styles.footerText}>© Rhea 2026</span>
      </footer>
    </>
  );
}

// ── Inline SVG goldfish (placeholder until you drop in your asset) ──
function Goldfish() {
  return (
    <svg
      width="32"
      height="28"
      viewBox="0 0 32 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="14" rx="10" ry="7" fill="#F5A520" />
      <circle cx="22" cy="11" r="1.5" fill="#1a1a1a" />
      <polygon points="6,14 0,8 0,20" fill="#F5A520" />
      <polygon points="6,14 2,10 4,18" fill="#E8920E" />
    </svg>
  );
}

// ── TV placeholder shown until /assets/tv-hero.png exists ──
function TvPlaceholder() {
  return (
    <div style={styles.tvPlaceholder}>
      <span style={{ fontSize: 48 }}>📺</span>
    </div>
  );
}

// ── Styles ──
const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    position: "sticky",
    top: 0,
    background: "var(--bg)",
    zIndex: 10,
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
  },
  navLinks: {
    display: "flex",
    gap: "28px",
  },
  navLink: {
    fontSize: "14px",
    color: "var(--text)",
    letterSpacing: "0.02em",
  },
  main: {
    maxWidth: "var(--max-w)",
    margin: "0 auto",
    padding: "0 24px 80px",
  },
  hero: {
    marginTop: "32px",
    marginBottom: "80px",
  },
  tvWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "28px",
    position: "relative",
  },
  tvImg: {
    width: "220px",
    height: "auto",
    position: "relative",
    zIndex: 1,
  },
  tvPlaceholder: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "220px",
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8e1d6",
    borderRadius: "12px",
    opacity: 0.6,
  },
  heroHeading: {
    fontSize: "18px",
    fontWeight: 400,
    fontFamily: "var(--font)",
    lineHeight: 1.5,
    marginBottom: "14px",
  },
  heroBio: {
    fontSize: "13px",
    color: "var(--text-muted)",
    lineHeight: 1.8,
  },
  section: {
    marginBottom: "72px",
  },
  sectionHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "16px",
    gap: "6px",
  },
  sectionIcon: {
    fontSize: "22px",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 400,
    fontFamily: "var(--font)",
    letterSpacing: "0.02em",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "4px",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  filterSep: {
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  filterBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font)",
    fontSize: "13px",
    color: "var(--text-muted)",
    padding: 0,
  },
  filterBtnActive: {
    color: "var(--text)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  filterArrow: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  card: {
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid var(--border)",
    aspectRatio: "1 / 0.85",
    display: "block",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardInner: {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  },
  aboutSection: {
    marginBottom: "72px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  arrowLink: {
    fontSize: "14px",
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "32px",
    borderTop: "1px solid var(--border)",
  },
  footerText: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
};
