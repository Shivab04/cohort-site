import { useState, useEffect, useRef, useCallback } from "react";

/* ─── PALETTE ─────────────────────────────────────────── */
const C = {
  lime:  "#80EF80",
  cream: "#E3F0A3",
  sage:  "#BADBA2",
  green: "#42D674",
  ink:   "#0D1F0D",
  ink2:  "#1A2E1A",
  white: "#F7FFF4",
  muted: "rgba(13,31,13,0.45)",
  ghost: "rgba(13,31,13,0.12)",
};

/* ─── GLOBAL STYLES injected once ─────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.white}; color: ${C.ink}; font-family: 'Cabinet Grotesk', sans-serif;
    -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: ${C.white}; }
  ::-webkit-scrollbar-thumb { background: ${C.green}; border-radius: 2px; }
  a { text-decoration: none; color: inherit; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes floatY { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-18px)} }
  @keyframes floatX { 0%,100%{transform:translateX(0px)} 50%{transform:translateX(12px)} }
  @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spinR { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
  @keyframes drip  { 0%{transform:scaleY(0);transform-origin:top}
    50%{transform:scaleY(1);transform-origin:top}
    51%{transform:scaleY(1);transform-origin:bottom}
    100%{transform:scaleY(0);transform-origin:bottom} }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes counterPop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes blobDrift1 { 0%,100%{border-radius:60% 40% 70% 30%/50% 60% 40% 70%}
    33%{border-radius:70% 30% 50% 50%/60% 40% 60% 40%}
    66%{border-radius:40% 60% 40% 60%/40% 70% 30% 60%} }
  @keyframes blobDrift2 { 0%,100%{border-radius:50% 50% 40% 60%/60% 30% 70% 40%}
    50%{border-radius:30% 70% 60% 40%/50% 60% 40% 50%} }
  @keyframes reveal { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
  @keyframes revealLeft { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
  @keyframes revealRight { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
  @keyframes typewriter { from{width:0} to{width:100%} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;

/* ─── HOOKS ───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useScroll() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const h = () => setScroll(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return scroll;
}

function useCountUp(target, active, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

/* ─── ANIMATED SECTION WRAPPER ───────────────────────── */
function Appear({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, visible] = useInView(0.12);
  const anim = { up: "reveal", left: "revealLeft", right: "revealRight", scale: "scaleIn" }[dir];
  return (
    <div ref={ref} style={{
      animation: visible ? `${anim} 0.85s ${delay}s cubic-bezier(.22,1,.36,1) both` : "none",
      opacity: visible ? undefined : 0,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── SVG ILLUSTRATIONS ───────────────────────────────── */

function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 520, display: "block" }}>
      {/* Background blob */}
      <ellipse cx="260" cy="240" rx="230" ry="210" fill={C.cream} opacity=".55"
        style={{ animation: "blobDrift1 10s ease-in-out infinite" }} />
      {/* Orbiting ring */}
      <circle cx="260" cy="240" r="175" stroke={C.sage} strokeWidth="1" strokeDasharray="8 6" opacity=".5"
        style={{ animation: "spin 28s linear infinite", transformOrigin: "260px 240px" }} />
      <circle cx="260" cy="240" r="130" stroke={C.lime} strokeWidth="1" strokeDasharray="4 8" opacity=".4"
        style={{ animation: "spinR 18s linear infinite", transformOrigin: "260px 240px" }} />
      {/* Center card */}
      <rect x="175" y="160" width="170" height="160" rx="22" fill={C.white} stroke={C.sage} strokeWidth="1.5" />
      <rect x="193" y="178" width="50" height="50" rx="14" fill={C.lime} opacity=".8" />
      {/* Avatar lines */}
      <circle cx="218" cy="203" r="14" fill={C.green} />
      <rect x="193" y="240" width="134" height="8" rx="4" fill={C.cream} />
      <rect x="193" y="256" width="90" height="8" rx="4" fill={C.ghost} />
      <rect x="193" y="272" width="110" height="8" rx="4" fill={C.ghost} />
      {/* High-fit badge */}
      <rect x="188" y="296" width="75" height="20" rx="10" fill={C.green} />
      <text x="225" y="310" textAnchor="middle" fill={C.ink} fontSize="9" fontFamily="Cabinet Grotesk" fontWeight="700">HIGH FIT</text>

      {/* Floating mini cards */}
      <g style={{ animation: "floatY 4s 0.5s ease-in-out infinite", transformOrigin: "80px 180px" }}>
        <rect x="30" y="155" width="115" height="64" rx="14" fill={C.white} stroke={C.sage} strokeWidth="1.2" />
        <circle cx="55" cy="180" r="12" fill={C.lime} />
        <rect x="74" y="172" width="58" height="7" rx="3" fill={C.cream} />
        <rect x="74" y="185" width="40" height="6" rx="3" fill={C.ghost} />
        <rect x="38" y="200" width="85" height="6" rx="3" fill={C.ghost} />
      </g>

      <g style={{ animation: "floatY 5s 1.2s ease-in-out infinite", transformOrigin: "420px 310px" }}>
        <rect x="365" y="280" width="120" height="64" rx="14" fill={C.white} stroke={C.sage} strokeWidth="1.2" />
        <circle cx="390" cy="305" r="12" fill={C.sage} />
        <rect x="408" y="297" width="60" height="7" rx="3" fill={C.cream} />
        <rect x="408" y="310" width="42" height="6" rx="3" fill={C.ghost} />
        <rect x="373" y="325" width="88" height="6" rx="3" fill={C.ghost} />
      </g>

      <g style={{ animation: "floatX 6s ease-in-out infinite", transformOrigin: "420px 140px" }}>
        <rect x="360" y="110" width="130" height="48" rx="14" fill={C.lime} opacity=".9" />
        <text x="425" y="130" textAnchor="middle" fill={C.ink} fontSize="11" fontFamily="Cabinet Grotesk" fontWeight="700">AI Engineer</text>
        <text x="425" y="148" textAnchor="middle" fill={C.ink} fontSize="9" fontFamily="Cabinet Grotesk" opacity=".6">OpenAI · Top match</text>
      </g>

      {/* Connecting dots */}
      {[[145,240],[265,65],[265,420],[90,300],[440,220]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill={C.green} opacity=".6"
          style={{ animation: `pulse 2s ${i*0.4}s ease-in-out infinite` }} />
      ))}
      {/* Lines from center to orbiting cards */}
      <line x1="175" y1="205" x2="145" y2="205" stroke={C.sage} strokeWidth="1" strokeDasharray="4 3" opacity=".5" />
      <line x1="345" y1="300" x2="365" y2="305" stroke={C.sage} strokeWidth="1" strokeDasharray="4 3" opacity=".5" />
    </svg>
  );
}

function AgentIllustration({ index }) {
  const configs = [
    { bg: C.lime,  shape: "circle",  label: "5M+\nProfiles",   color: C.ink  },
    { bg: C.cream, shape: "hex",     label: "128\nContacted",  color: C.ink  },
    { bg: C.sage,  shape: "diamond", label: "Top 1%\nScreened", color: C.ink  },
    { bg: C.green, shape: "ring",    label: "38\nInterviews",  color: C.white },
  ];
  const c = configs[index];

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
      <rect width="120" height="120" rx="24" fill={c.bg} opacity=".25" />
      {index === 0 && <>
        <circle cx="60" cy="52" r="28" fill={c.bg} opacity=".5" style={{ animation: "blobDrift2 7s ease-in-out infinite" }} />
        <circle cx="60" cy="52" r="18" fill={c.bg} />
        <circle cx="60" cy="44" r="8" fill={C.white} />
        <path d="M44 70 Q60 60 76 70" stroke={C.white} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="60" y="98" textAnchor="middle" fill={C.ink} fontSize="8.5" fontFamily="Cabinet Grotesk" fontWeight="700">5M+ Profiles</text>
      </>}
      {index === 1 && <>
        <rect x="32" y="32" width="56" height="44" rx="10" fill={c.bg} opacity=".7" />
        <rect x="40" y="42" width="40" height="4" rx="2" fill={C.ink} opacity=".4" />
        <rect x="40" y="50" width="28" height="4" rx="2" fill={C.ink} opacity=".4" />
        <rect x="40" y="58" width="34" height="4" rx="2" fill={C.ink} opacity=".4" />
        <circle cx="88" cy="34" r="10" fill={C.green} />
        <text x="88" y="38" textAnchor="middle" fill={C.white} fontSize="9" fontFamily="Cabinet Grotesk" fontWeight="800">↗</text>
        <text x="60" y="98" textAnchor="middle" fill={C.ink} fontSize="8.5" fontFamily="Cabinet Grotesk" fontWeight="700">Outreach</text>
      </>}
      {index === 2 && <>
        <polygon points="60,24 82,42 74,68 46,68 38,42" fill={c.bg} opacity=".7" />
        <circle cx="60" cy="50" r="10" fill={C.white} />
        <path d="M53 50 L58 55 L68 44" stroke={C.green} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="98" textAnchor="middle" fill={C.ink} fontSize="8.5" fontFamily="Cabinet Grotesk" fontWeight="700">Screening</text>
      </>}
      {index === 3 && <>
        <circle cx="60" cy="52" r="28" stroke={c.bg} strokeWidth="3" fill="none" />
        <circle cx="60" cy="52" r="18" fill={c.bg} />
        <text x="60" y="56" textAnchor="middle" fill={C.ink} fontSize="14" fontFamily="Cabinet Grotesk" fontWeight="800">✓</text>
        <text x="60" y="98" textAnchor="middle" fill={C.ink} fontSize="8.5" fontFamily="Cabinet Grotesk" fontWeight="700">Closing</text>
      </>}
    </svg>
  );
}

function WaveIllustration() {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
      <path d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z" fill={C.cream} />
    </svg>
  );
}

function CompareIllustration() {
  return (
    <svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 340 }}>
      {/* Old way */}
      <rect x="0" y="20" width="155" height="160" rx="18" fill={C.ghost} stroke={C.sage} strokeWidth="1" />
      <text x="77" y="48" textAnchor="middle" fill={C.muted} fontSize="10" fontFamily="Cabinet Grotesk" fontWeight="700" letterSpacing="1">OLD WAY</text>
      {[60,80,100,120,140].map((y, i) => (
        <g key={i}>
          <circle cx="22" cy={y} r="4" fill={C.muted} opacity=".4" />
          <rect x="34" y={y-5} width={[80,60,70,55,75][i]} height="9" rx="4" fill={C.muted} opacity=".25" />
        </g>
      ))}
      <rect x="14" y="152" width="127" height="18" rx="8" fill="rgba(200,50,50,.12)" />
      <text x="77" y="165" textAnchor="middle" fill="rgba(200,50,50,.6)" fontSize="9" fontFamily="Cabinet Grotesk" fontWeight="600">Just vibes 😵</text>

      {/* Arrow */}
      <text x="170" y="108" textAnchor="middle" fill={C.green} fontSize="22" fontFamily="Cabinet Grotesk" fontWeight="800">→</text>

      {/* Cohort way */}
      <rect x="185" y="20" width="155" height="160" rx="18" fill={C.lime} opacity=".3" stroke={C.green} strokeWidth="1.5" />
      <text x="262" y="48" textAnchor="middle" fill={C.ink} fontSize="10" fontFamily="Cabinet Grotesk" fontWeight="700" letterSpacing="1">COHORT WAY</text>
      {[
        "Tell us the role",
        "AI screens fast",
        "Top 3 in 72hrs",
        "Fast. Precise.",
      ].map((t, i) => (
        <g key={i}>
          <circle cx="204" cy={66 + i * 24} r="5" fill={C.green} />
          <text x="216" y={70 + i * 24} fill={C.ink} fontSize="9.5" fontFamily="Cabinet Grotesk" fontWeight="500">{t}</text>
        </g>
      ))}
      <rect x="199" y="162" width="127" height="8" rx="4" fill={C.green} opacity=".3"
        style={{ animation: "lineGrow 1.5s 0.5s ease both", transformOrigin: "199px 0" }} />
    </svg>
  );
}

function NetworkIllustration() {
  const nodes = [
    [160,100], [60,180], [260,180], [100,280], [220,280],
    [40,80], [280,80], [160,260],
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,3],[2,4],[3,7],[4,7]];
  return (
    <svg viewBox="0 0 320 360" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 320 }}>
      {edges.map(([a,b],i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={C.sage} strokeWidth="1.2" strokeDasharray="5 4" opacity=".6" />
      ))}
      {nodes.map(([cx,cy], i) => (
        <g key={i} style={{ animation: `pulse ${2.5 + i*0.3}s ${i*0.2}s ease-in-out infinite` }}>
          <circle cx={cx} cy={cy} r={i===0?22:14} fill={i===0?C.green:C.lime} opacity={i===0?0.9:0.5} />
          <circle cx={cx} cy={cy} r={i===0?22:14} stroke={i===0?C.ink:C.sage} strokeWidth="1" fill="none" />
          {i === 0 && <text x={cx} y={cy+4} textAnchor="middle" fill={C.ink} fontSize="10" fontFamily="Cabinet Grotesk" fontWeight="800">AI</text>}
        </g>
      ))}
    </svg>
  );
}

/* ─── NAV ─────────────────────────────────────────────── */
function Nav({ scrollY }) {
  const stuck = scrollY > 60;
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "1.2rem 3rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: stuck ? "rgba(247,255,244,0.88)" : "transparent",
      backdropFilter: stuck ? "blur(18px)" : "none",
      borderBottom: stuck ? `1px solid ${C.ghost}` : "1px solid transparent",
      transition: "all 0.4s ease",
    }}>
      <span style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.6rem", color: C.ink, fontWeight: 400, letterSpacing: "-0.02em" }}>
        Cohort
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {["Blog", "Privacy Policy"].map(l => (
          <a key={l} href={l === "Blog" ? "https://thecohort.ai/blog" : "https://thecohort.ai/privacy-policy"}
            style={{ fontSize: "0.82rem", letterSpacing: "0.05em", color: C.muted, fontWeight: 500,
              transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.ink}
            onMouseLeave={e => e.target.style.color = C.muted}
          >{l}</a>
        ))}
        <a href="https://thecohort.ai/get-started"
          style={{ padding: "0.6rem 1.4rem", background: C.ink, color: C.lime,
            borderRadius: "100px", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em",
            transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.background = C.green; e.target.style.color = C.ink; }}
          onMouseLeave={e => { e.target.style.background = C.ink; e.target.style.color = C.lime; }}
        >See Candidates Now</a>
      </div>
    </nav>
  );
}

/* ─── PROGRESS BAR ────────────────────────────────────── */
function ProgressBar({ scrollY }) {
  const pct = typeof document !== "undefined"
    ? (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    : 0;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 200, height: 3,
      width: `${pct}%`, background: C.green, transition: "width 0.08s linear" }} />
  );
}

/* ─── HERO ────────────────────────────────────────────── */
function Hero({ scrollY }) {
  const parallax = scrollY * 0.35;
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "8rem 3rem 5rem", background: C.white, position: "relative", overflow: "hidden" }}>
      {/* Blobs */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "60% 40% 70% 30%/50% 60% 40% 70%",
        background: C.lime, opacity: 0.22, top: -120, right: -80,
        transform: `translateY(${-parallax * 0.4}px)`,
        animation: "blobDrift1 14s ease-in-out infinite", transition: "transform 0.1s" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50% 50% 40% 60%/60% 30% 70% 40%",
        background: C.cream, opacity: 0.55, bottom: -60, left: -60,
        transform: `translateY(${-parallax * 0.2}px)`,
        animation: "blobDrift2 10s ease-in-out infinite", transition: "transform 0.1s" }} />
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%",
        background: C.sage, opacity: 0.3, top: "35%", left: "38%",
        transform: `translateY(${-parallax * 0.6}px)`, transition: "transform 0.1s" }} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${C.ghost} 1px, transparent 1px), linear-gradient(90deg, ${C.ghost} 1px, transparent 1px)`,
        backgroundSize: "64px 64px", opacity: 0.6 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.4rem 1rem",
            background: C.cream, borderRadius: 100, marginBottom: "2rem",
            animation: "fadeSlideUp 0.9s 0.1s ease both" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green,
              display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: C.ink, fontWeight: 700 }}>AI Recruiting Software</span>
          </div>

          <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: "clamp(3rem,7vw,6rem)",
            fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1, color: C.ink, marginBottom: "1.8rem",
            animation: "fadeSlideUp 0.9s 0.25s ease both" }}>
            Hire<br/>
            <em style={{ color: C.green, fontStyle: "italic" }}>unicorn</em><br/>
            talent fast.
          </h1>

          <p style={{ fontSize: "1.1rem", color: C.muted, fontWeight: 400, lineHeight: 1.7,
            maxWidth: 420, marginBottom: "2.5rem",
            animation: "fadeSlideUp 0.9s 0.4s ease both" }}>
            We built Cohort to help you find top-tier talent in days, not weeks. No fluff. Just results.
          </p>

          <div style={{ display: "flex", gap: "1rem", animation: "fadeSlideUp 0.9s 0.55s ease both" }}>
            <a href="https://thecohort.ai/get-started"
              style={{ padding: "0.95rem 2.2rem", background: C.ink, color: C.lime, borderRadius: "100px",
                fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em", border: `2px solid ${C.ink}`,
                transition: "all 0.25s" }}
              onMouseEnter={e => { e.target.style.background = C.green; e.target.style.borderColor = C.green; e.target.style.color = C.ink; }}
              onMouseLeave={e => { e.target.style.background = C.ink; e.target.style.borderColor = C.ink; e.target.style.color = C.lime; }}
            >Get Started Free</a>
            <a href="https://thecohort.ai/get-started"
              style={{ padding: "0.95rem 2.2rem", background: "transparent", color: C.ink, borderRadius: "100px",
                fontWeight: 500, fontSize: "0.9rem", border: `1.5px solid ${C.ghost}`, transition: "all 0.25s" }}
              onMouseEnter={e => { e.target.style.borderColor = C.ink; }}
              onMouseLeave={e => { e.target.style.borderColor = C.ghost; }}
            >See How It Works</a>
          </div>
        </div>

        {/* Right illustration */}
        <div style={{ animation: "fadeSlideUp 1s 0.3s ease both" }}>
          <HeroIllustration />
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "fadeSlideUp 1s 1s ease both" }}>
        <div style={{ width: 1, height: 52, background: `linear-gradient(to bottom, ${C.green}, transparent)`,
          animation: "drip 2s ease-in-out infinite" }} />
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>Scroll</span>
      </div>
    </section>
  );
}

/* ─── TRUST ───────────────────────────────────────────── */
const LOGOS = ["Ulta Beauty","Expedia","Apple","Motorola","Kroger","Capital One","State Farm","CME Group","Here","Visa"];

function Trust() {
  return (
    <div style={{ padding: "2rem 0", borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}`,
      background: C.white, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "0 3rem", marginBottom: "1.2rem" }}>
        <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted,
          fontWeight: 600, whiteSpace: "nowrap" }}>Trusted by</span>
        <div style={{ height: 1, flex: 1, background: C.ghost }} />
      </div>
      <div style={{ overflow: "hidden",
        WebkitMask: "linear-gradient(90deg,transparent,black 12%,black 88%,transparent)",
        mask: "linear-gradient(90deg,transparent,black 12%,black 88%,transparent)" }}>
        <div style={{ display: "flex", gap: "3.5rem", alignItems: "center",
          width: "max-content", animation: "marquee 24s linear infinite" }}>
          {[...LOGOS,...LOGOS].map((l, i) => (
            <span key={i} style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.05rem",
              fontWeight: 400, color: C.muted, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TAGLINE SECTION ─────────────────────────────────── */
function Tagline() {
  const [ref, visible] = useInView(0.2);
  return (
    <section ref={ref} style={{ padding: "8rem 3rem", background: C.cream, textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* decorative circles */}
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:`1px dashed ${C.sage}`,
        top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"spin 40s linear infinite" }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", border:`1px dashed ${C.lime}`,
        top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"spinR 60s linear infinite", opacity:.4 }} />

      <div style={{ maxWidth: 800, margin:"0 auto", position:"relative", zIndex:1 }}>
        <Appear delay={0}>
          <p style={{ fontSize:"0.75rem", letterSpacing:"0.14em", textTransform:"uppercase", color:C.green,
            fontWeight:700, marginBottom:"1.5rem" }}>Our mission</p>
        </Appear>
        <Appear delay={0.1}>
          <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(2rem,5vw,3.8rem)",
            fontWeight:400, letterSpacing:"-0.03em", lineHeight:1.15, color:C.ink }}>
            What cloud computing did for servers,<br/>
            <em style={{ color:C.green }}>we're doing for recruitment.</em>
          </h2>
        </Appear>
        <Appear delay={0.2}>
          <a href="https://thecohort.ai/get-started"
            style={{ display:"inline-block", marginTop:"2.5rem", padding:"0.9rem 2.2rem",
              background:C.ink, color:C.lime, borderRadius:"100px", fontWeight:700, fontSize:"0.9rem" }}>
            Get Started
          </a>
        </Appear>
      </div>
    </section>
  );
}

/* ─── AGENTS / HOW IT WORKS ───────────────────────────── */
const AGENTS = [
  { num:"01", label:"Acquiring high-fit candidates", name:"Sally the Sourcer",
    desc:"Your always-on talent scout. Sally scans millions of profiles across the globe — LinkedIn, GitHub, proprietary datasets — to keep your pipeline filled with qualified, unicorn-caliber candidates. She never sleeps, so you never miss the perfect hire.",
    stat:"5M+ profiles scanned" },
  { num:"02", label:"Contacting 128 users", name:"Pete the Prospector",
    desc:"Your personal outreach machine. Pete turns cold leads into warm conversations with personalized, scalable messages that feel one-on-one. He boosts response rates and builds candidate interest — so when it's time to interview, they're already engaged.",
    stat:"128 users contacted" },
  { num:"03", label:"Evaluating technical fit", name:"Eva the Evaluator",
    desc:"Your tireless screener. Eva runs technical assessments, resume reviews, and coding challenges to shortlist only the best-fit talent. She brings consistency, objectivity, and serious time savings — so your team only sees top performers.",
    stat:"Top 1% shortlisted" },
  { num:"04", label:"38 interviews in progress", name:"Charlie the Closer",
    desc:"Your closer. Charlie handles final interviews, offer logistics, and onboarding coordination with precision and speed. He reduces drop-off risk and ensures your dream candidate doesn't slip away.",
    stat:"38 interviews live" },
];

function AgentCard({ agent, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Appear delay={index * 0.12} dir="up">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? C.lime : C.white, border: `1.5px solid ${hovered ? C.green : C.ghost}`,
          borderRadius: 24, padding: "2.5rem", cursor: "default",
          transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
          transform: hovered ? "translateY(-6px)" : "none",
          boxShadow: hovered ? `0 20px 50px rgba(66,214,116,0.2)` : "none" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <AgentIllustration index={index} />
          <span style={{ fontFamily:"Instrument Serif, serif", fontSize:"3.5rem", fontWeight:400,
            color: hovered ? C.ink : C.ghost, lineHeight:1, transition:"color 0.3s" }}>{agent.num}</span>
        </div>
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase",
          color: C.green, fontWeight:700, marginBottom:"0.5rem" }}>{agent.label}</p>
        <h3 style={{ fontFamily:"Instrument Serif, serif", fontSize:"1.5rem", fontWeight:400,
          letterSpacing:"-0.02em", color:C.ink, marginBottom:"0.75rem" }}>{agent.name}</h3>
        <p style={{ fontSize:"0.9rem", color:C.muted, lineHeight:1.75, fontWeight:400, marginBottom:"1.5rem" }}>{agent.desc}</p>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"0.3rem 0.9rem",
          background: hovered ? C.green : C.cream, borderRadius:100, transition:"background 0.3s" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:C.ink, display:"inline-block" }} />
          <span style={{ fontSize:"0.78rem", color:C.ink, fontWeight:600 }}>{agent.stat}</span>
        </div>
      </div>
    </Appear>
  );
}

function Agents() {
  return (
    <section style={{ padding:"8rem 3rem", background:C.white }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <Appear>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.green, fontWeight:700, marginBottom:"1rem" }}>Meet SPEC</p>
        </Appear>
        <Appear delay={0.1}>
          <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(2.5rem,5vw,4rem)",
            fontWeight:400, letterSpacing:"-0.03em", lineHeight:1.1, color:C.ink, marginBottom:"1rem" }}>
            Four agents.<br/>One mission: better hires, faster.
          </h2>
        </Appear>
        <Appear delay={0.15}>
          <p style={{ fontSize:"1rem", color:C.muted, fontWeight:400, maxWidth:520, marginBottom:"4rem", lineHeight:1.7 }}>
            A full-stack team of AI agents designed to hire unicorn talent faster than humanly possible.
          </p>
        </Appear>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1.25rem" }}>
          {AGENTS.map((a,i) => <AgentCard key={i} agent={a} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── FOUNDER CTA BANNER ──────────────────────────────── */
function FounderBanner() {
  return (
    <section style={{ padding:"8rem 3rem", background:C.ink, position:"relative", overflow:"hidden" }}>
      {/* big decorative C */}
      <div style={{ position:"absolute", right:"-5%", top:"50%", transform:"translateY(-50%)",
        fontFamily:"Instrument Serif, serif", fontSize:"clamp(200px,30vw,380px)", fontWeight:400,
        color:"rgba(128,239,128,0.05)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>C</div>

      <div style={{ maxWidth:800, margin:"0 auto", position:"relative", zIndex:1 }}>
        <Appear>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.sage, fontWeight:700, marginBottom:"2rem" }}>Founder's story</p>
        </Appear>
        <Appear delay={0.1}>
          <p style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(1.5rem,4vw,2.8rem)",
            fontWeight:400, letterSpacing:"-0.025em", lineHeight:1.35, color:C.white, marginBottom:"2rem" }}>
            As co-founder of Egen, we spent years scaling high-performance engineering teams for Chicago's most iconic unicorns — growing from 2 to 100+ engineers.
          </p>
        </Appear>
        <Appear delay={0.2}>
          <p style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(1.3rem,3vw,2.2rem)",
            fontWeight:400, letterSpacing:"-0.02em", lineHeight:1.4, color:C.lime, marginBottom:"2rem" }}>
            "What AWS did for servers, Cohort is doing for hiring. Scalable. Reliable. Built for speed."
          </p>
        </Appear>
        <Appear delay={0.3}>
          <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:580 }}>
            Cohort is the evolution of that experience — inspired by those lessons but built independently from the ground up. No fluff. No pitch decks. Just a system that delivers — 3x faster than traditional recruiting. Your hiring roadblocks? They're our problem now.
          </p>
        </Appear>
      </div>
    </section>
  );
}

/* ─── COMPARE (Old vs New) ────────────────────────────── */
const OLD_WAY = ["You post","Calls that go nowhere","You pray","You hope","100 resumés, 2 maybes","No data","Just vibes"];
const NEW_WAY = ["Tell us the role","We screen with AI","You get the 3 top-fit candidates in under 72 hours","Fast. Precise. Scalable."];

function Compare() {
  return (
    <section style={{ padding:"8rem 3rem", background:C.sage }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
          <div>
            <Appear>
              <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
                color:C.green, fontWeight:700, marginBottom:"1rem" }}>The Cohort way</p>
            </Appear>
            <Appear delay={0.1}>
              <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(2rem,4.5vw,3.5rem)",
                fontWeight:400, letterSpacing:"-0.03em", lineHeight:1.1, color:C.ink, marginBottom:"1.5rem" }}>
                Stop hiring on vibes.
              </h2>
            </Appear>
            <Appear delay={0.15}>
              <p style={{ fontSize:"1rem", color:C.ink2, fontWeight:400, lineHeight:1.75, marginBottom:"2.5rem", opacity:0.7 }}>
                Founders don't have time to guess who's good. We built Cohort to make sure you don't have to.
              </p>
            </Appear>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              {/* Old way card */}
              <Appear delay={0.2}>
                <div style={{ background:"rgba(13,31,13,0.08)", borderRadius:20, padding:"1.75rem" }}>
                  <p style={{ fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase",
                    color:"rgba(13,31,13,0.4)", fontWeight:700, marginBottom:"1rem" }}>The old way</p>
                  {OLD_WAY.slice(0,5).map((t,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                      fontSize:"0.82rem", color:"rgba(13,31,13,0.5)", padding:"0.4rem 0",
                      borderBottom:`1px solid rgba(13,31,13,0.06)` }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(13,31,13,0.2)", flexShrink:0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              </Appear>
              {/* Cohort way card */}
              <Appear delay={0.3}>
                <div style={{ background:C.lime, borderRadius:20, padding:"1.75rem" }}>
                  <p style={{ fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase",
                    color:C.ink, fontWeight:700, marginBottom:"1rem" }}>The Cohort way</p>
                  {NEW_WAY.map((t,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                      fontSize:"0.82rem", color:C.ink, padding:"0.4rem 0",
                      borderBottom:`1px solid rgba(13,31,13,0.08)` }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, flexShrink:0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              </Appear>
            </div>
          </div>

          <Appear dir="right" delay={0.1}>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <NetworkIllustration />
            </div>
          </Appear>
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ────────────────────────────────────────── */
const FEATURES = [
  { icon:"⚡", title:"Elite Candidates at Lightning Speed",
    desc:"Our AI scans 5M+ profiles to instantly find top technical talent — even passive candidates. Prioritize by skill, cut 90% of manual sourcing." },
  { icon:"🎯", title:"AI-Talent Targeting with Pinpoint Precision",
    desc:"Our AI scores candidates on skills, culture fit, and trajectory — learning from your decisions to refine results. No more mismatches." },
  { icon:"🔗", title:"Skip the Admin, Land the Perfect Hire",
    desc:"Our AI handles outreach, scheduling, and tracking — syncing with Greenhouse or Lever to cut admin and reduce time-to-hire by 40%." },
];

function Features() {
  return (
    <section style={{ padding:"8rem 3rem", background:C.white }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <Appear>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.green, fontWeight:700, marginBottom:"1rem" }}>Platform</p>
        </Appear>
        <Appear delay={0.1}>
          <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(2rem,4.5vw,3.5rem)",
            fontWeight:400, letterSpacing:"-0.03em", lineHeight:1.1, color:C.ink, marginBottom:"4rem" }}>
            Everything you need<br/>to hire smarter.
          </h2>
        </Appear>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5px",
          border:`1.5px solid ${C.ghost}`, borderRadius:28, overflow:"hidden",
          background:C.ghost }}>
          {FEATURES.map((f,i) => {
            const [hovered, setHovered] = useState(false);
            return (
              <Appear key={i} delay={i*0.12}>
                <div
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  style={{ background: hovered ? C.cream : C.white, padding:"3rem 2.5rem",
                    transition:"background 0.35s", position:"relative", overflow:"hidden", cursor:"default" }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                    background:`linear-gradient(90deg,${C.lime},${C.green})`,
                    transform: hovered ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin:"left", transition:"transform 0.4s ease" }} />
                  <span style={{ fontSize:"2rem", display:"block", marginBottom:"1.5rem" }}>{f.icon}</span>
                  <h3 style={{ fontFamily:"Instrument Serif, serif", fontSize:"1.25rem", fontWeight:400,
                    letterSpacing:"-0.02em", color:C.ink, marginBottom:"0.75rem" }}>{f.title}</h3>
                  <p style={{ fontSize:"0.875rem", color:C.muted, lineHeight:1.75, fontWeight:400 }}>{f.desc}</p>
                </div>
              </Appear>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ────────────────────────────────────── */
const TESTIMONIALS = [
  { quote:"Hiring before Cohort was like using dial-up in a fiber world. Once you get a taste of their speed, precision, and signal, you can't go back. They're not just a tool. They're a cheat code.",
    by:"Founder", role:"Seed-stage DevTools Startup" },
  { quote:"Cohort is dangerously good. Within a week, we filled two roles that had been open for months. Now every new req starts with: 'Has Cohort seen this yet?' We're hooked.",
    by:"Head of People", role:"Series B SaaS Company" },
  { quote:"Working with Cohort is like upgrading from a rental car to a Tesla. It's smoother, smarter, and once you experience it, you're not going back. They've completely changed how we think about recruiting.",
    by:"CTO", role:"AI-first Logistics Platform" },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a+1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ padding:"8rem 3rem", background:C.cream, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%",
        border:`1px dashed ${C.sage}`, top:"50%", left:"50%",
        transform:"translate(-50%,-50%)", animation:"spin 50s linear infinite", opacity:.4 }} />

      <div style={{ maxWidth:1000, margin:"0 auto", position:"relative", zIndex:1 }}>
        <Appear>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.green, fontWeight:700, marginBottom:"1rem" }}>Customer testimonials</p>
        </Appear>
        <Appear delay={0.1}>
          <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(2rem,4vw,3rem)",
            fontWeight:400, letterSpacing:"-0.03em", color:C.ink, marginBottom:"4rem" }}>
            Operators love Cohort.
          </h2>
        </Appear>

        {/* Big featured quote */}
        <div style={{ position:"relative", minHeight:220 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ position: i === 0 ? "relative" : "absolute", top:0, left:0, right:0,
              opacity: active === i ? 1 : 0,
              transform: active === i ? "translateY(0)" : "translateY(20px)",
              transition:"all 0.6s cubic-bezier(.22,1,.36,1)",
              pointerEvents: active === i ? "auto" : "none" }}>
              <blockquote style={{ fontFamily:"Instrument Serif, serif",
                fontSize:"clamp(1.3rem,3.5vw,2.2rem)", fontWeight:400, fontStyle:"italic",
                letterSpacing:"-0.02em", lineHeight:1.45, color:C.ink, marginBottom:"2rem" }}>
                "{t.quote}"
              </blockquote>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:C.green,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"Instrument Serif", fontSize:"1.1rem", color:C.ink }}>
                  {t.by[0]}
                </div>
                <div>
                  <p style={{ fontSize:"0.875rem", fontWeight:700, color:C.ink }}>{t.by}</p>
                  <p style={{ fontSize:"0.78rem", color:C.green, fontWeight:600 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display:"flex", gap:8, marginTop:"3rem" }}>
          {TESTIMONIALS.map((_,i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: active===i ? 28 : 8, height:8, borderRadius:100,
                background: active===i ? C.green : C.sage, border:"none", cursor:"pointer",
                transition:"all 0.3s" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── METRICS ─────────────────────────────────────────── */
const METRICS = [
  { num:3,   suffix:"x",   label:"Faster than traditional recruiting" },
  { num:40,  suffix:"%",   label:"Reduction in time-to-hire" },
  { num:72,  suffix:"hrs", label:"To your top 3 candidates" },
  { num:90,  suffix:"%",   label:"Less manual sourcing work" },
];

function MetricCard({ m, index }) {
  const [ref, visible] = useInView(0.4);
  const val = useCountUp(m.num, visible, 1800);
  return (
    <div ref={ref} style={{ textAlign:"center", padding:"3.5rem 2rem",
      animation: visible ? `counterPop 0.6s ${index*0.1}s ease both` : "none",
      opacity: visible ? undefined : 0 }}>
      <div style={{ fontFamily:"Instrument Serif, serif",
        fontSize:"clamp(3rem,6vw,5rem)", fontWeight:400, letterSpacing:"-0.04em",
        color:C.ink, lineHeight:1, marginBottom:"0.75rem" }}>
        {val}{m.suffix}
      </div>
      <p style={{ fontSize:"0.85rem", color:C.muted, fontWeight:500, letterSpacing:"0.04em" }}>{m.label}</p>
    </div>
  );
}

function Metrics() {
  return (
    <section style={{ padding:"6rem 3rem", background:C.white,
      borderTop:`1px solid ${C.ghost}`, borderBottom:`1px solid ${C.ghost}` }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <Appear style={{ textAlign:"center", marginBottom:"3rem" }}>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.green, fontWeight:700 }}>Results</p>
        </Appear>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:"1px", background:C.ghost, border:`1px solid ${C.ghost}`, borderRadius:24, overflow:"hidden" }}>
          {METRICS.map((m,i) => (
            <div key={i} style={{ background:C.white }}>
              <MetricCard m={m} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────── */
function CTA() {
  const [ref, visible] = useInView(0.2);
  return (
    <section ref={ref} style={{ padding:"10rem 3rem", background:C.ink, textAlign:"center", position:"relative", overflow:"hidden" }}>
      {/* rings */}
      {[200,380,560].map((r,i) => (
        <div key={i} style={{ position:"absolute", width:r, height:r, borderRadius:"50%",
          border:`1px solid rgba(128,239,128,${0.08-i*0.02})`,
          top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          animation:`blobDrift1 ${8+i*4}s ${i*2}s ease-in-out infinite` }} />
      ))}

      <div style={{ position:"relative", zIndex:1, maxWidth:700, margin:"0 auto" }}>
        <Appear>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.sage, fontWeight:700, marginBottom:"1.5rem" }}>Ready to build your Cohort?</p>
        </Appear>
        <Appear delay={0.1}>
          <h2 style={{ fontFamily:"Instrument Serif, serif", fontSize:"clamp(3rem,8vw,6rem)",
            fontWeight:400, letterSpacing:"-0.04em", lineHeight:1, color:C.lime, marginBottom:"1.5rem" }}>
            Stop wasting<br/><em>time</em> on hiring.
          </h2>
        </Appear>
        <Appear delay={0.2}>
          <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.4)", lineHeight:1.75,
            maxWidth:480, margin:"0 auto 2.5rem", fontWeight:400 }}>
            Find your top 3 unicorn candidates — free — for your current job opening. No fluff. No waiting. Just results.
          </p>
        </Appear>
        <Appear delay={0.3}>
          <a href="https://thecohort.ai/get-started"
            style={{ display:"inline-block", padding:"1.1rem 3rem", background:C.green, color:C.ink,
              borderRadius:"100px", fontWeight:700, fontSize:"1rem", letterSpacing:"0.04em",
              transition:"all 0.25s", border:`2px solid ${C.green}` }}
            onMouseEnter={e => { e.target.style.background = C.lime; e.target.style.borderColor = C.lime; e.target.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.target.style.background = C.green; e.target.style.borderColor = C.green; e.target.style.transform = "scale(1)"; }}
          >Get Started for Free</a>
        </Appear>
        <Appear delay={0.4}>
          <p style={{ marginTop:"1.25rem", fontSize:"0.78rem", color:"rgba(255,255,255,0.2)" }}>
            Start attracting, engaging, and hiring elite talent today.
          </p>
        </Appear>
      </div>
    </section>
  );
}

/* ─── FOOTER ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:C.ink2, padding:"4rem 3rem 2rem", borderTop:`1px solid rgba(255,255,255,0.05)` }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          flexWrap:"wrap", gap:"3rem", paddingBottom:"3rem",
          borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ maxWidth:260 }}>
            <span style={{ fontFamily:"Instrument Serif, serif", fontSize:"1.8rem", fontWeight:400,
              color:C.lime, display:"block", marginBottom:"0.75rem" }}>Cohort</span>
            <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.3)", lineHeight:1.65 }}>
              Fast, precise, and scalable AI-powered recruiting platform founded by engineers who have scaled teams at unicorn startups.
            </p>
          </div>
          <div style={{ display:"flex", gap:"4rem" }}>
            <div>
              <p style={{ fontSize:"0.7rem", letterSpacing:"0.14em", textTransform:"uppercase",
                color:C.sage, fontWeight:700, marginBottom:"1.25rem" }}>Company</p>
              {[["Blog","https://thecohort.ai/blog"],["Privacy Policy","https://thecohort.ai/privacy-policy"]].map(([l,h]) => (
                <a key={l} href={h} style={{ display:"block", fontSize:"0.85rem",
                  color:"rgba(255,255,255,0.35)", marginBottom:"0.75rem", transition:"color 0.2s" }}
                  onMouseEnter={e=>e.target.style.color=C.lime}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize:"0.7rem", letterSpacing:"0.14em", textTransform:"uppercase",
                color:C.sage, fontWeight:700, marginBottom:"1.25rem" }}>Get Started</p>
              <a href="https://thecohort.ai/get-started" style={{ display:"block", fontSize:"0.85rem",
                color:"rgba(255,255,255,0.35)", marginBottom:"0.75rem", transition:"color 0.2s" }}
                onMouseEnter={e=>e.target.style.color=C.lime}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>See Candidates Now</a>
            </div>
          </div>
        </div>
        <div style={{ paddingTop:"2rem", display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.2)" }}>© 2025 Cohort. All rights reserved.</span>
          <a href="https://www.linkedin.com/company/thecohortai/posts/?feedView=all"
            style={{ width:34, height:34, borderRadius:9, border:"1px solid rgba(255,255,255,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.8rem", color:"rgba(255,255,255,0.35)", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.lime; e.currentTarget.style.color=C.lime; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}
          >in</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT APP ────────────────────────────────────────── */
export default function App() {
  const scrollY = useScroll();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div>
      <ProgressBar scrollY={scrollY} />
      <Nav scrollY={scrollY} />
      <Hero scrollY={scrollY} />
      <Trust />
      <Tagline />
      <Agents />
      <FounderBanner />
      <Compare />
      <Features />
      <Testimonials />
      <Metrics />
      <CTA />
      <Footer />
    </div>
  );
}
