import { useState, useEffect, useRef } from "react";

// ============================================================
//  the water vessel
//  A hydrangea you grow with your own hands.
// ============================================================

// ---------- Realistic blue hydrangea palette ----------
const PALETTE: { inner: string; outer: string; tip: string }[] = [
  { inner: "#4a78b8", outer: "#2d5288", tip: "#a8c8e8" },
  { inner: "#5688c4", outer: "#356098", tip: "#b8d4ec" },
  { inner: "#6896c8", outer: "#4070a0", tip: "#c4dcec" },
  { inner: "#7ca4cc", outer: "#4c7ca8", tip: "#d0e4f0" },
  { inner: "#88aed0", outer: "#5888b0", tip: "#dcecf4" },
  { inner: "#94b6d4", outer: "#6494b8", tip: "#e4f0f6" },
  { inner: "#a8b8d4", outer: "#7896b8", tip: "#ecf0f6" },
  { inner: "#9cb0d0", outer: "#6890b4", tip: "#e8eef4" },
  { inner: "#b0c0dc", outer: "#84a0c4", tip: "#f0f4f8" },
  { inner: "#5680b8", outer: "#345c90", tip: "#b4d0e8" },
  { inner: "#6890c0", outer: "#406898", tip: "#c0d8ec" },
  { inner: "#7898c4", outer: "#4870a0", tip: "#ccdcec" },
];

// ---------- Accent palette for florets added one at a time ----------
const ACCENT_PALETTE: { inner: string; outer: string; tip: string }[] = [
  { inner: "#9b7fc4", outer: "#6e52a0", tip: "#d4c4e8" },
  { inner: "#e6acc4", outer: "#c97f9e", tip: "#f6e0ec" },
  { inner: "#eef0f6", outer: "#c4c8d4", tip: "#ffffff" },
  { inner: "#39497c", outer: "#222e52", tip: "#8a9ac2" },
  { inner: "#aad2ea", outer: "#79aed2", tip: "#ddf1f9" },
];

const PALETTE_BASE_LEN = PALETTE.length;
PALETTE.push(...ACCENT_PALETTE);

function randomAccentColorIndex(): number {
  return PALETTE_BASE_LEN + Math.floor(Math.random() * ACCENT_PALETTE.length);
}

type Floret = {
  id: number; x: number; y: number; r: number; rot: number;
  seed: number; colorIndex: number; born: number;
};

const MAX_FLORETS = 60;

function positionForIndex(i: number): { x: number; y: number; r: number; rot: number } {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const a = i * golden;
  const radius = Math.min(135, 21 * Math.sqrt(i + 0.5));
  const jitter = Math.sin(i * 12.9898) * 6;
  return {
    x: Math.cos(a) * radius + jitter,
    y: Math.sin(a) * radius + jitter * 0.6,
    r: 33 + (i % 3),
    rot: (a * 180) / Math.PI + 30,
  };
}

let floretCounter = 0;
function makeFloret(index: number, colorIndex?: number): Floret {
  const p = positionForIndex(index);
  return {
    id: floretCounter++,
    x: p.x, y: p.y, r: p.r, rot: p.rot,
    seed: index + 1,
    colorIndex: colorIndex ?? index % PALETTE_BASE_LEN,
    born: Date.now(),
  };
}

const INITIAL_FLORET_COUNT = 24;
const OPEN_FLORET_COUNT = 2;
const INTRO_BLOOM_MS = 10_000;
const INTRO_TO_TEND_MS = 1_500;
const STEM_GROW_MS = 6_000;

// ---------- Blessing scene (pink hydrangea + slow droplet + message) ----------
const PINK_PALETTE: { inner: string; outer: string }[] = [
  { inner: "#e8a8c4", outer: "#c97f9e" },
  { inner: "#f0bcd2", outer: "#d692ae" },
  { inner: "#e89ab8", outer: "#c06e92" },
  { inner: "#f4c8da", outer: "#dca0bc" },
  { inner: "#e6b0c8", outer: "#c885a4" },
];
const BLESSING_MESSAGE = "あなたは美しい";
const BLESSING_DROP_MS = 10_000;
const BLESSING_TYPE_MS = 380;
const HANDOVER_MESSAGE = "あなたは愛されていい";
const HANDOVER_TYPE_MS = 380;

function seedBloom(): Floret[] {
  const born = Date.now() - 60_000;
  return Array.from({ length: OPEN_FLORET_COUNT }, (_, i) => {
    const f = makeFloret(i);
    return { ...f, r: f.r * 3, born };
  });
}

function FloretShape({
  floret, mode, onTap, useFloatIn = false,
}: {
  floret: Floret; mode: GrowMode; onTap: (id: number) => void; useFloatIn?: boolean;
}) {
  const { x: cx, y: cy, r: size, rot, inner, outer, tip, seed } = {
    ...floret,
    inner: PALETTE[floret.colorIndex].inner,
    outer: PALETTE[floret.colorIndex].outer,
    tip: PALETTE[floret.colorIndex].tip,
  };
  const s = size * 0.62;
  const rand = (n: number) => {
    const v = Math.sin(seed * 9.7 + n * 3.1) * 10000;
    return v - Math.floor(v);
  };
  const gradId = `pg-${seed}`;
  const tipGradId = `pt-${seed}`;

  const now = Date.now();
  if (now < floret.born) return null;

  const age = now - floret.born;
  const isFloating = useFloatIn && age < 2800;
  const isNew = !useFloatIn && age < 700;

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}
      onClick={(e) => { e.stopPropagation(); onTap(floret.id); }}
      style={{
        cursor: mode === "remove" ? "pointer" : "default",
        transformOrigin: "center", transformBox: "fill-box",
        animation: isFloating ? "floretFloatIn 2.8s ease-out both"
          : isNew ? "floretBloom 0.7s ease-out both" : undefined,
      }}>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="85%" r="95%">
          <stop offset="0%"  stopColor={outer} stopOpacity="0.95" />
          <stop offset="45%" stopColor={inner} />
          <stop offset="100%" stopColor={tip} />
        </radialGradient>
        <radialGradient id={tipGradId} cx="50%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor={tip} stopOpacity="0" />
        </radialGradient>
      </defs>
      {mode === "remove" && (
        <circle r={s * 1.15} fill="none" stroke={outer} strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="2 3" />
      )}
      {[0, 90, 180, 270].map((a, i) => {
        const jitterA = (rand(i) - 0.5) * 14;
        const w = s * (0.68 + rand(i + 1) * 0.18);
        const h = s * (0.92 + rand(i + 2) * 0.22);
        const skew = (rand(i + 3) - 0.5) * 0.15;
        const path = `M 0 0 C ${w * 0.55} ${-h * 0.05}, ${w * (0.55 + skew)} ${-h * 0.65}, ${skew * w * 0.5} ${-h} C ${-w * (0.55 - skew)} ${-h * 0.65}, ${-w * 0.55} ${-h * 0.05}, 0 0 Z`;
        return (
          <g key={a} transform={`rotate(${a + jitterA})`}>
            <path d={path} fill={`url(#${gradId})`} stroke={outer} strokeWidth="0.5" strokeOpacity="0.45" />
            <path d={path} fill={`url(#${tipGradId})`} />
          </g>
        );
      })}
      <circle r={s * 0.10} fill={outer} opacity="0.85" />
      <circle r={s * 0.04} fill="#fff8d8" opacity="0.7" />
    </g>
  );
}

function FallenPetal({
  x, y, inner, outer, rot, delay,
}: { x: number; y: number; inner: string; outer: string; rot: number; delay: number; }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}
      style={{ opacity: 0, animation: `petalSettle 1.6s ease-out ${delay}s forwards` }}>
      <ellipse rx="15" ry="10.5" fill={inner} opacity="0.85" />
      <ellipse rx="15" ry="10.5" fill="none" stroke={outer} strokeWidth="0.5" />
    </g>
  );
}

type Step = "open" | "growing" | "awakening" | "tend" | "task"
          | "reflection" | "blessing" | "revealing" | "handover";
type GrowMode = "grow" | "remove";

export default function App() {
  const [step, setStep] = useState<Step>("open");
  const [florets, setFlorets] = useState<Floret[]>(seedBloom);
  const [mode, setMode] = useState<GrowMode>("grow");
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const offeringDir = 0;
  const [handoverTouched, setHandoverTouched] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [dropletLanded, setDropletLanded] = useState(false);
  const [blessingTyped, setBlessingTyped] = useState(0);
  const [handoverTyped, setHandoverTyped] = useState(0);

  const [, force] = useState(0);
  useEffect(() => {
    if (step !== "tend" && step !== "awakening") return;
    const id = setInterval(() => force((n) => n + 1), 80);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "awakening") return;
    const id = setTimeout(() => setStep("tend"), INTRO_BLOOM_MS + INTRO_TO_TEND_MS);
    return () => clearTimeout(id);
  }, [step]);

  // Growing scene: the stem slowly extends to 2x, then the bloom awakens
  useEffect(() => {
    if (step !== "growing") return;
    const id = setTimeout(() => startIntro(), STEM_GROW_MS);
    return () => clearTimeout(id);
  }, [step]);

  // Blessing scene: droplet takes 10s to fall, then the message is typed out
  useEffect(() => {
    if (step !== "blessing") return;
    setDropletLanded(false);
    setBlessingTyped(0);
    const id = setTimeout(() => setDropletLanded(true), BLESSING_DROP_MS);
    return () => clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step !== "blessing" || !dropletLanded) return;
    if (blessingTyped >= BLESSING_MESSAGE.length) return;
    const id = setTimeout(() => setBlessingTyped((n) => n + 1), BLESSING_TYPE_MS);
    return () => clearTimeout(id);
  }, [step, dropletLanded, blessingTyped]);

  useEffect(() => {
    if (step === "handover") {
      setHandoverTouched(false);
      setHandoverTyped(0);
    }
  }, [step]);

  // Handover scene: type the final message once the petal is touched
  useEffect(() => {
    if (step !== "handover" || !handoverTouched) return;
    if (handoverTyped >= HANDOVER_MESSAGE.length) return;
    const id = setTimeout(() => setHandoverTyped((n) => n + 1), HANDOVER_TYPE_MS);
    return () => clearTimeout(id);
  }, [step, handoverTouched, handoverTyped]);

  const activeTasks = tasks.filter((t) => !t.done);
  const fallenTasks = tasks.filter((t) => t.done);
  const accentColor = "#4a78b8";
  const accentDeep  = "#2d5288";

  const addFloret = () => {
    setFlorets((fs) => {
      if (fs.length >= MAX_FLORETS) return fs;
      return [...fs, makeFloret(fs.length, randomAccentColorIndex())];
    });
  };

  const removeFloret = (id: number) => {
    if (mode !== "remove") return;
    setFlorets((fs) => {
      const next = fs.filter((f) => f.id !== id);
      return next.map((f, i) => {
        const p = positionForIndex(i);
        return { ...f, x: p.x, y: p.y, r: p.r, rot: p.rot };
      });
    });
  };

  const handleBloomBackgroundTap = () => {
    if (step === "tend" && mode === "grow") addFloret();
  };

  const startIntro = () => {
    const start = Date.now();
    const bloom = Array.from({ length: INITIAL_FLORET_COUNT }, (_, i) => {
      const f = makeFloret(i);
      return { ...f, born: start + (i / INITIAL_FLORET_COUNT) * INTRO_BLOOM_MS };
    });
    setFlorets(bloom);
    setStep("awakening");
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      fontFamily: "'Shippori Mincho', 'Noto Serif JP', 'Hiragino Mincho ProN', serif",
      background: "linear-gradient(180deg, #cbcdd2 0%, #d8dde2 60%, #c8cdd2 100%)",
      transition: "background 2s ease", color: "#3a3a3a",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      padding: "2rem 1rem 3rem", position: "relative", overflow: "hidden", boxSizing: "border-box",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.5), transparent 50%)," +
          "radial-gradient(ellipse at 75% 25%, rgba(255,255,255,0.4), transparent 55%)," +
          "radial-gradient(ellipse at 50% 8%, rgba(255,255,255,0.35), transparent 60%)",
        animation: "cloudDrift 60s ease-in-out infinite alternate",
      }} />

      <style>{`
        @keyframes cloudDrift { 0% { transform: translateX(-3%); } 100% { transform: translateX(3%); } }
        @keyframes petalSettle {
          0%   { opacity: 0; transform: translate(0px, -80px) rotate(0deg) scale(0.6); }
          70%  { opacity: 0.9; }
          100% { opacity: 0.85; transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes floretBloom {
          0% { opacity: 0; transform: scale(0.2); }
          60% { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes floretFloatIn {
          0% { opacity: 0; transform: scale(0.12) translateY(18px); }
          35% { opacity: 0.55; transform: scale(0.85) translateY(-6px); }
          65% { opacity: 0.92; transform: scale(1.1) translateY(3px); }
          85% { opacity: 1; transform: scale(0.97) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes panelReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bloomReveal { from { opacity: 0.85; } to { opacity: 1; } }
        @keyframes breatheIn {
          0% { transform: scale(1); opacity: 0.85; }
          100% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes whisperIn {
          0%   { opacity: 0; transform: translateY(6px); letter-spacing: 0.5em; }
          100% { opacity: 1; transform: translateY(0);  letter-spacing: 0.22em; }
        }
        @keyframes waterRise {
          0%   { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0%);   opacity: 1; }
        }
        @keyframes blessingDrop {
          0%   { transform: translate(-50%, 0) scale(0.6); opacity: 0; }
          6%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
          90%  { opacity: 1; }
          100% { transform: translate(-50%, var(--drop-dist, 150px)) scale(1.2, 0.75); opacity: 0.85; }
        }
        @keyframes ripple {
          0%   { transform: translateX(-50%) scale(0.3); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(2.4); opacity: 0; }
        }
        @keyframes rippleWide {
          0%   { transform: translateX(-50%) scale(0.3); opacity: 0.95; }
          60%  { opacity: 0.7; }
          100% { transform: translateX(-50%) scale(4.8); opacity: 0; }
        }
        @keyframes waterShimmer { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.85; } }
        @keyframes petalStream {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.85; }
          100% { transform: translate(var(--stream-x, 0px), var(--stream-y, -200px)) scale(0.6); opacity: 0; }
        }
        @keyframes petalDescend {
          0%   { transform: translate(-50%, -240px) rotate(-8deg); opacity: 0; }
          10%  { opacity: 1; }
          25%  { transform: translate(-50%, -180px) rotate(12deg); }
          45%  { transform: translate(-50%, -100px) rotate(-10deg); }
          65%  { transform: translate(-50%, -40px) rotate(8deg); }
          85%  { transform: translate(-50%, 10px) rotate(-4deg); }
          100% { transform: translate(-50%, 0px) rotate(0deg); opacity: 1; }
        }
        @keyframes petalGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(168,200,232,0.5)); }
          50%      { filter: drop-shadow(0 0 18px rgba(168,200,232,0.9)); }
        }
        @keyframes pulseHint { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes stemGrow {
          from { transform: scaleY(1); }
          to   { transform: scaleY(2); }
        }
        @keyframes spin12 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes petalFall {
          0%   { transform: translateY(-12vh) rotate(0deg); opacity: 0; }
          12%  { opacity: 0.95; }
          88%  { opacity: 0.95; }
          100% { transform: translateY(110vh) rotate(380deg); opacity: 0; }
        }
        /* handover caption: lower on desktop, closer to center on mobile */
        .handover-caption { top: calc(50% + 100px); }
        @media (max-width: 600px) {
          .handover-caption { top: calc(50% + 45px); }
        }
        .fade-up { animation: fadeUp 1.2s ease-out both; }
        .voice-line {
          font-style: italic; color: #5a5a5a; letter-spacing: 0.05em;
          font-size: 0.85rem; opacity: 0.75; min-height: 1.2em;
        }
        input:focus {
          border-color: ${accentDeep} !important;
          background: rgba(255,255,255,0.75) !important;
        }
        button:hover { background: rgba(255,255,255,0.75) !important; }
      `}</style>

      <div className="fade-up" style={{ marginBottom: "0.5rem", textAlign: "center", zIndex: 1 }}>
        <h1 style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "2.8rem", fontWeight: 400, letterSpacing: "0.04em",
          margin: 0, fontStyle: "normal", color: "#3a3a3a",
        }}>
          the water vessel
        </h1>
        <p className="voice-line" style={{ marginTop: "0.4rem" }}>
          {step === "open"      && "（声：今日もここにあるよ）"}
          {step === "awakening" && ""}
          {step === "tend"      && (mode === "grow" ? "空いたところを そっと 押すと、咲きます" : "花びらを 押すと、ひとつ 手放せます")}
          {step === "task"     && ""}
        </p>
      </div>

      <svg viewBox="-200 -200 400 780" width="100%" onClick={handleBloomBackgroundTap}
        style={{
          maxWidth: 360, height: "auto", zIndex: 1,
          transition: "filter 2s ease",
          cursor: step === "tend" && mode === "grow" ? "pointer" : "default",
        }}>
        <rect x="-200" y="-200" width="400" height="780" fill="transparent" />
        <g style={{
          transformBox: "fill-box", transformOrigin: "center top",
          animation: step === "growing" ? `stemGrow ${STEM_GROW_MS}ms ease-in-out forwards` : undefined,
        }}>
          <path d="M 0 110 C -7 240 9 366 -5 470" stroke="#5a6e4a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>

        <g>
          <defs>
            <linearGradient id="leafGradL" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#6e8c6f" /><stop offset="50%" stopColor="#84a886" /><stop offset="100%" stopColor="#9ec4a0" />
            </linearGradient>
          </defs>
          <g transform="translate(-2 230) scale(0.6 -0.6) translate(2 -230)">
            <path d="M -2 230 Q -28 194 -52 206 Q -75 204 -88 284 Q -92 326 -80 356 Q -62 374 -42 356 Q -22 332 -8 290 Q -2 266 -2 230 Z"
              fill="url(#leafGradL)" stroke="#5a7a5b" strokeWidth="0.6" strokeOpacity="0.4" />
            <path d="M -2 254 Q -40 284 -82 314" stroke="#5a7a5b" strokeWidth="0.7" fill="none" opacity="0.45" />
            <path d="M -18 260 Q -28 284 -34 314" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
            <path d="M -40 272 Q -50 296 -56 332" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
            <path d="M -60 290 Q -70 312 -74 346" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
          </g>
          {step === "tend" && (
            <text x="-29" y="185" textAnchor="middle"
              fill="rgba(255,255,255,0.9)" fontSize="8"
              fontFamily="'Shippori Mincho', 'Noto Serif JP', serif"
              letterSpacing="0.05em"
              style={{ pointerEvents: "none", userSelect: "none" }}>
              いま{florets.length}輪
            </text>
          )}
        </g>

        <g>
          <defs>
            <linearGradient id="leafGradR" x1="100%" y1="0%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#6e8c6f" /><stop offset="50%" stopColor="#84a886" /><stop offset="100%" stopColor="#9ec4a0" />
            </linearGradient>
          </defs>
          <g transform="translate(2 306) scale(0.6 -0.6) translate(-2 -306)">
            <path d="M 2 306 Q 28 268 52 284 Q 75 306 88 366 Q 92 408 80 438 Q 62 452 42 434 Q 22 410 8 366 Q 2 342 2 306 Z"
              fill="url(#leafGradR)" stroke="#5a7a5b" strokeWidth="0.6" strokeOpacity="0.4" />
            <path d="M 2 332 Q 40 362 82 392" stroke="#5a7a5b" strokeWidth="0.7" fill="none" opacity="0.45" />
            <path d="M 20 338 Q 30 362 36 392" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
            <path d="M 42 350 Q 52 374 58 410" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
            <path d="M 62 368 Q 72 392 76 422" stroke="#5a7a5b" strokeWidth="0.4" fill="none" opacity="0.3" />
          </g>
        </g>

        <g style={{
          transformOrigin: "center",
          animation: step === "awakening" ? "bloomReveal 1.5s ease-out both" : undefined,
        }}>
          {florets.map((f) => (
            <FloretShape key={f.id} floret={f} mode={mode} onTap={removeFloret} useFloatIn={step === "awakening"} />
          ))}
        </g>

        {fallenTasks.map((t, i) => {
          const c = PALETTE[i % PALETTE.length];
          const x = -100 + (i % 6) * 34 + (Math.floor(i / 6) % 2) * 17;
          const y = 516 + Math.floor(i / 6) * 14;
          const rot = (i * 47) % 360;
          return <FallenPetal key={t.id} x={x} y={y} inner={c.inner} outer={c.outer} rot={rot} delay={i * 0.15} />;
        })}
      </svg>

      <div style={{
        position: "fixed", bottom: "1.2rem", left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 360, padding: "0 1rem", boxSizing: "border-box", zIndex: 5,
      }}>
        {step === "open" && (
          <button type="button" onClick={() => setStep("growing")} style={btnStyle}>
            tap
          </button>
        )}

        {step === "tend" && (
          <div style={{ animation: "panelReveal 1.5s ease-out both" }}>
            <div style={{
              display: "flex", gap: "0.5rem", marginBottom: "0.8rem",
              background: "rgba(255,255,255,0.35)", padding: "0.35rem", borderRadius: "999px",
            }}>
              <button type="button" onClick={() => setMode("grow")}
                style={{ ...pillStyle, padding: "0.385rem 0.56rem", fontSize: "0.63rem", letterSpacing: "0.07em", background: mode === "grow" ? accentColor : "transparent", color: mode === "grow" ? "#fff" : "#3a3a3a" }}>
                花びらを 増やす
              </button>
              <button type="button" onClick={() => setMode("remove")}
                style={{ ...pillStyle, padding: "0.385rem 0.56rem", fontSize: "0.63rem", letterSpacing: "0.07em", background: mode === "remove" ? accentColor : "transparent", color: mode === "remove" ? "#fff" : "#3a3a3a" }}>
                花びらを 消す
              </button>
            </div>
            <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, padding: "0.49rem 0.84rem", fontSize: "0.665rem", letterSpacing: "0.105em", background: accentColor, color: "#fff" }}>
              この花で、すすむ
            </button>
          </div>
        )}

        {step === "task" && (
          <div className="fade-up">
            <input ref={inputRef} type="text" value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && taskInput.trim()) {
                  e.preventDefault();
                  setTasks((ts) => [...ts, { id: Date.now(), text: taskInput.trim(), done: false }]);
                  setTaskInput("");
                }
              }}
              placeholder="言いたいこと書いて"
              style={{
                width: "100%", padding: "0.56rem 0.7rem",
                border: `1px solid ${accentDeep}`, borderRadius: "999px",
                background: "rgba(255,255,255,0.6)", fontFamily: "inherit",
                fontSize: "0.7rem", color: "#3a3a3a", outline: "none",
                marginBottom: "0.8rem", boxSizing: "border-box", transition: "all 0.3s ease",
              }} />
            <button type="button" onClick={() => setStep("reflection")}
              style={{ ...btnStyle, padding: "0.49rem 0.84rem", fontSize: "0.665rem", letterSpacing: "0.105em", background: accentColor, color: "#fff" }}>
              いってきます
            </button>
            {activeTasks.length > 0 && (
              <ul style={{ marginTop: "1rem", padding: 0, listStyle: "none", fontSize: "0.9rem" }}>
                {activeTasks.map((t) => (
                  <li key={t.id} style={{
                    padding: "0.5rem 0.8rem", marginBottom: "0.3rem",
                    background: "rgba(255,255,255,0.4)", borderRadius: "8px",
                    borderLeft: `3px solid ${accentDeep}`,
                  }}>
                    {t.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>

      {/* === Closing arc: reflection → offering → revealing → handover === */}

      {step === "reflection" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(180deg, #cbcdd2 0%, #b8c2cf 50%, #6a8aa8 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", animation: "fadeUp 1.4s ease-out both",
        }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 320, marginTop: "-2rem" }}>
            <svg viewBox="-120 -130 240 260" width="100%" style={{ display: "block" }}>
              <path d="M 0 60 Q 6 90 -2 120" stroke="#3a4a2c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <g>
                {florets.slice(0, Math.min(florets.length, 28)).map((f, i) => {
                  const c = PALETTE[f.colorIndex];
                  const sx = f.x * 0.55;
                  const sy = f.y * 0.55 - 30;
                  return (
                    <g key={f.id} transform={`translate(${sx} ${sy})`}>
                      {[0, 90, 180, 270].map((a) => (
                        <path key={a} d="M 0 0 C 8 -1, 8 -12, 0 -16 C -8 -12, -8 -1, 0 0 Z"
                          transform={`rotate(${a + i * 3})`} fill={c.inner} stroke={c.outer} strokeWidth="0.4" opacity="0.92" />
                      ))}
                      <circle r="1.4" fill={c.outer} opacity="0.7" />
                    </g>
                  );
                })}
              </g>
            </svg>
            <div style={{
              position: "relative", width: "100%", height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              marginTop: "0.4rem",
            }} />
            <div style={{ position: "relative", width: "100%", animation: "waterRise 2.2s ease-out 0.4s both" }}>
              <svg viewBox="-120 -130 240 260" width="100%" style={{
                display: "block", transform: "scaleY(-1)",
                filter: "blur(0.7px) brightness(0.78) hue-rotate(-8deg)",
                opacity: 0.72, animation: "waterShimmer 4s ease-in-out infinite",
              }}>
                <path d="M 0 60 Q 6 90 -2 120" stroke="#3a4a2c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <g>
                  {florets.slice(0, Math.min(florets.length, 28)).map((f, i) => {
                    const c = PALETTE[f.colorIndex];
                    const sx = f.x * 0.55;
                    const sy = f.y * 0.55 - 30;
                    return (
                      <g key={f.id} transform={`translate(${sx} ${sy})`}>
                        {[0, 90, 180, 270].map((a) => (
                          <path key={a} d="M 0 0 C 8 -1, 8 -12, 0 -16 C -8 -12, -8 -1, 0 0 Z"
                            transform={`rotate(${a + i * 3})`} fill={c.inner} stroke={c.outer} strokeWidth="0.4" />
                        ))}
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div style={{
                position: "absolute", top: "10%", left: "50%", width: "60px", height: "12px",
                border: "2px solid rgba(255,255,255,0.98)", borderRadius: "50%",
                boxShadow: "0 0 10px rgba(255,255,255,0.85)",
                animation: "rippleWide 10.5s ease-out 1.5s infinite", pointerEvents: "none",
              }} />
            </div>
          </div>

          <p style={{
            marginTop: "1.5rem", fontSize: "1.05rem", letterSpacing: "0.22em",
            color: "#2a3a52", fontStyle: "italic", textAlign: "center",
            opacity: 0, animation: "whisperIn 2s ease-out 2.5s forwards",
          }}>
            映った姿も、本物
          </p>

          <button type="button" onClick={() => setStep("blessing")}
            style={{
              position: "absolute", bottom: "2.5rem", right: "1.5rem",
              padding: "0.6rem 1.4rem", fontFamily: "inherit",
              fontSize: "0.85rem", letterSpacing: "0.25em",
              background: "transparent", border: "1px solid rgba(45,82,136,0.4)",
              borderRadius: "999px", color: "#2a3a52", cursor: "pointer",
              opacity: 0, animation: "whisperIn 1.4s ease-out 4s forwards",
            }}>
            next →
          </button>
        </div>
      )}

      {step === "blessing" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(180deg, #f6e9ef 0%, #f0d8e4 55%, #e8c4d6 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", animation: "fadeUp 1.4s ease-out both",
        }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <svg viewBox="-120 -150 240 330" width="100%" style={{ display: "block" }}>
              <path d="M 0 30 Q 8 120 -2 230" stroke="#6e8a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <g>
                {florets.slice(0, Math.min(florets.length, 28)).map((f, i) => {
                  const c = PINK_PALETTE[i % PINK_PALETTE.length];
                  const sx = f.x * 0.55;
                  const sy = f.y * 0.55 - 40;
                  return (
                    <g key={f.id} transform={`translate(${sx} ${sy}) scale(2)`}>
                      {[0, 90, 180, 270].map((a) => (
                        <path key={a} d="M 0 0 C 8 -1, 8 -12, 0 -16 C -8 -12, -8 -1, 0 0 Z"
                          transform={`rotate(${a + i * 3})`} fill={c.inner} stroke={c.outer} strokeWidth="0.4" opacity="0.95" />
                      ))}
                      <circle r="1.4" fill={c.outer} opacity="0.7" />
                    </g>
                  );
                })}
              </g>
            </svg>

            {!dropletLanded && (
              <div style={{
                position: "absolute", left: "50%", top: "28%",
                ["--drop-dist" as any]: "150px",
                animation: "blessingDrop 10s ease-in forwards",
              }}>
                <svg viewBox="-6 -8 12 16" width="13" height="17" style={{ display: "block" }}>
                  <defs>
                    <radialGradient id="blessingDropGrad" cx="50%" cy="35%" r="65%">
                      <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="55%" stopColor="#f7dfeb" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#e2a6c4" stopOpacity="0.85" />
                    </radialGradient>
                  </defs>
                  <path d="M 0 -7 Q -5 0 -5 4 Q -5 8 0 8 Q 5 8 5 4 Q 5 0 0 -7 Z"
                    fill="url(#blessingDropGrad)" stroke="#d98ab0" strokeWidth="0.3" strokeOpacity="0.5" />
                </svg>
              </div>
            )}

            {dropletLanded && (
              <div style={{
                position: "absolute", left: "50%", top: "calc(28% + 150px)",
                width: "34px", height: "8px", transform: "translate(-50%, -50%)",
                border: "1px solid rgba(214,138,176,0.6)", borderRadius: "50%",
                animation: "ripple 2.4s ease-out 0s 2", pointerEvents: "none",
              }} />
            )}
          </div>

          <p style={{
            marginTop: "2rem", minHeight: "3em",
            fontSize: "1.25rem", letterSpacing: "0.22em", lineHeight: 2,
            color: "#a64d7a", fontStyle: "italic", textAlign: "center",
            fontFamily: "inherit",
          }}>
            {BLESSING_MESSAGE.slice(0, blessingTyped)}
            {dropletLanded && blessingTyped < BLESSING_MESSAGE.length && (
              <span style={{ opacity: 0.4 }}>｜</span>
            )}
          </p>

          {blessingTyped >= BLESSING_MESSAGE.length && (
            <button type="button" onClick={() => setStep("revealing")}
              style={{
                position: "absolute", bottom: "2.5rem", right: "1.5rem",
                padding: "0.6rem 1.4rem", fontFamily: "inherit",
                fontSize: "0.85rem", letterSpacing: "0.25em",
                background: "transparent", border: "1px solid rgba(166,77,122,0.4)",
                borderRadius: "999px", color: "#a64d7a", cursor: "pointer",
                opacity: 0, animation: "whisperIn 1.4s ease-out 0.2s forwards",
              }}>
              next →
            </button>
          )}
        </div>
      )}

      {step === "revealing" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "#0f1828",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", animation: "fadeUp 2s ease-out both", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {fallenTasks.length === 0 ? (
              [0, 1, 2, 3, 4].map((i) => {
                const c = PALETTE[i % PALETTE.length];
                const startX = 50 + (i - 2) * 4;
                const dx = offeringDir * (180 + i * 30);
                const dy = -200 - i * 40;
                return (
                  <div key={i} style={{
                    position: "absolute", left: `${startX}%`, top: "55%",
                    width: 14, height: 10, borderRadius: "50%",
                    background: c.inner, boxShadow: `0 0 8px ${c.tip}`,
                    ["--stream-x" as any]: `${dx}px`,
                    ["--stream-y" as any]: `${dy}px`,
                    animation: `petalStream ${5 + i * 0.4}s ease-out ${i * 0.5}s infinite`,
                  }} />
                );
              })
            ) : (
              fallenTasks.map((t, i) => {
                const c = PALETTE[i % PALETTE.length];
                const startX = 45 + (i % 8) * 2;
                const dx = offeringDir * (160 + (i % 5) * 40) + (offeringDir === 0 ? (i % 2 === 0 ? -1 : 1) * 80 : 0);
                const dy = -220 - (i % 4) * 30;
                return (
                  <div key={t.id} style={{
                    position: "absolute", left: `${startX}%`, top: "55%",
                    width: 14, height: 10, borderRadius: "50%",
                    background: c.inner, boxShadow: `0 0 8px ${c.tip}`,
                    ["--stream-x" as any]: `${dx}px`,
                    ["--stream-y" as any]: `${dy}px`,
                    animation: `petalStream 6s ease-out ${i * 0.35}s infinite`,
                  }} />
                );
              })
            )}
          </div>

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 360 }}>
            <p style={{
              fontSize: "1.1rem", letterSpacing: "0.2em",
              color: "#e0e8f0", fontStyle: "italic", lineHeight: 2,
              opacity: 0, animation: "whisperIn 3s ease-out 1.5s forwards",
            }}>
              諦めてもいいし
            </p>
            <p style={{
              fontSize: "1.1rem", letterSpacing: "0.22em",
              color: "#c8d8e8", fontStyle: "italic", lineHeight: 2, marginTop: "0.5rem",
              opacity: 0, animation: "whisperIn 3s ease-out 4s forwards",
            }}>
              諦めなければ続くよ
            </p>
          </div>

          <button type="button" onClick={() => setStep("handover")}
            style={{
              position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
              padding: "0.6rem 1.8rem", fontFamily: "inherit",
              fontSize: "0.85rem", letterSpacing: "0.25em",
              background: "transparent", border: "1px solid rgba(200,216,232,0.4)",
              borderRadius: "999px", color: "#c8d8e8", cursor: "pointer",
              opacity: 0, animation: "whisperIn 1.6s ease-out 9s forwards",
            }}>
            next
          </button>
        </div>
      )}

      {step === "handover" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(180deg, #c8cdd2 0%, #b4becd 60%, #a0afc3 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "2rem 1.5rem", animation: "fadeUp 1.4s ease-out both",
        }}>
          {/* small petals drifting down after the touch — continues until back */}
          {handoverTouched && (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const c = PINK_PALETTE[i % PINK_PALETTE.length];
                const left = (i * 37 + 6) % 100;
                const dur = 7 + (i % 5) * 1.6;
                const delay = (i % 7) * 0.7;
                const size = 7 + (i % 3) * 3;
                return (
                  <div key={i} style={{
                    position: "absolute", top: 0, left: `${left}%`,
                    width: size, height: size * 0.72,
                    background: c.inner,
                    borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
                    boxShadow: `0 0 4px ${c.outer}`,
                    opacity: 0,
                    animation: `petalFall ${dur}s linear ${delay}s infinite`,
                  }} />
                );
              })}
            </div>
          )}

          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, 0)",
            animation: "petalDescend 4s cubic-bezier(0.4, 0, 0.4, 1) both",
            cursor: handoverTouched ? "default" : "pointer",
          }}
            onClick={() => {
              if (handoverTouched) return;
              setHandoverTouched(true);
              const audio = new Audio("/audio/handover.mp3");
              audio.volume = 0.85;
              audioRef.current = audio;
              audio.play().catch(() => {});
            }}>
            <div style={{
              transition: "transform 0.6s ease",
              transform: handoverTouched ? "scale(1.15)" : "scale(1)",
              filter: "blur(3px)",
            }}>
            <svg viewBox="-50 -50 100 100" width="120" height="120" style={{
              display: "block",
              animation: handoverTouched
                ? "spin12 12s linear infinite"
                : "petalGlow 2.8s ease-in-out infinite, spin12 12s linear infinite",
            }}>
              <defs>
                <radialGradient id="handoverGrad" cx="50%" cy="80%" r="90%">
                  <stop offset="0%"  stopColor="#b5497e" />
                  <stop offset="45%" stopColor="#e08ab0" />
                  <stop offset="100%" stopColor="#fbe6f0" />
                </radialGradient>
                <radialGradient id="handoverHighlight" cx="50%" cy="25%" r="55%">
                  <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#fbe6f0" stopOpacity="0" />
                </radialGradient>
              </defs>
              {[0, 90, 180, 270].map((a) => (
                <g key={a} transform={`rotate(${a})`}>
                  <path d="M 0 0 C 22 -2, 22 -28, 0 -40 C -22 -28, -22 -2, 0 0 Z"
                    fill="url(#handoverGrad)" stroke="#c06e92" strokeWidth="0.6" strokeOpacity="0.5" />
                  <path d="M 0 0 C 22 -2, 22 -28, 0 -40 C -22 -28, -22 -2, 0 0 Z"
                    fill="url(#handoverHighlight)" />
                </g>
              ))}
              <circle r="4" fill="#b5497e" opacity="0.85" />
              <circle r="1.5" fill="#fff8d8" opacity="0.7" />
            </svg>
            </div>
          </div>

          <div className="handover-caption" style={{
            position: "absolute",
            left: "50%", transform: "translateX(-50%)",
            textAlign: "center",
            opacity: 0, animation: "whisperIn 2s ease-out 4.2s forwards",
            pointerEvents: "none", width: "100%", maxWidth: 360,
          }}>
            <p style={{
              fontSize: "1.15rem", letterSpacing: "0.22em",
              color: "#2a3a52", fontStyle: "italic",
              margin: 0, fontFamily: "inherit",
            }}>
              ここに　ゆり落ちる
            </p>
            {!handoverTouched && (
              <p style={{
                marginTop: "1.5rem", fontSize: "0.78rem",
                letterSpacing: "0.3em", color: "#4a5e7a",
                animation: "pulseHint 3s ease-in-out infinite",
                fontStyle: "italic",
              }}>
                そっと 触れてみて
              </p>
            )}
            {handoverTouched && (
              <p style={{
                marginTop: "1.5rem", minHeight: "1.8em",
                fontSize: "1.1rem", letterSpacing: "0.22em", color: "#a64d7a",
                fontStyle: "italic",
              }}>
                {HANDOVER_MESSAGE.slice(0, handoverTyped)}
                {handoverTyped < HANDOVER_MESSAGE.length && <span style={{ opacity: 0.4 }}>｜</span>}
              </p>
            )}
          </div>

          <button type="button"
            onClick={() => {
              if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
              setFlorets(seedBloom());
              setStep("open");
            }}
            style={{
              position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
              padding: "0.6rem 1.8rem", fontFamily: "inherit",
              fontSize: "0.85rem", letterSpacing: "0.25em",
              background: "transparent", border: "1px solid rgba(45,82,136,0.4)",
              borderRadius: "999px", color: "#2a3a52", cursor: "pointer",
              opacity: 0, animation: "whisperIn 1.6s ease-out 5.5s forwards",
            }}>
            back
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: "100%", padding: "0.7rem 1.2rem", fontFamily: "inherit",
  fontSize: "0.95rem", letterSpacing: "0.15em",
  background: "rgba(255,255,255,0.55)", border: "1px solid #2d5288",
  borderRadius: "999px", color: "#3a3a3a", cursor: "pointer",
  transition: "all 0.4s ease", backdropFilter: "blur(4px)",
};

const pillStyle: React.CSSProperties = {
  flex: 1, padding: "0.55rem 0.8rem", fontFamily: "inherit",
  fontSize: "0.9rem", letterSpacing: "0.1em",
  background: "transparent", border: "none",
  borderRadius: "999px", color: "#3a3a3a", cursor: "pointer",
  transition: "all 0.3s ease",
};