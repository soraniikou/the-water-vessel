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

function seedBloom(): Floret[] {
  const born = Date.now() - 60_000;
  return Array.from({ length: OPEN_FLORET_COUNT }, (_, i) => ({ ...makeFloret(i), born }));
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

type Step = "open" | "awakening" | "tend" | "task" | "leaving" | "home"
          | "reflection" | "offering" | "revealing" | "handover";
type GrowMode = "grow" | "remove";

export default function App() {
  const [step, setStep] = useState<Step>("open");
  const [florets, setFlorets] = useState<Floret[]>(seedBloom);
  const [mode, setMode] = useState<GrowMode>("grow");
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [shizukuDropped, setShizukuDropped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [offeringDir, setOfferingDir] = useState<number>(0);
  const [handoverTouched, setHandoverTouched] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Shizuku scene
  useEffect(() => {
    if (step !== "leaving") return;
    setShizukuDropped(false);
    const id = setTimeout(() => setShizukuDropped(true), 3200);
    return () => clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step === "handover") {
      setHandoverTouched(false);
      setAudioPlayed(false);
    }
  }, [step]);

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
        @keyframes shizukuFall {
          0%   { opacity: 0; transform: translateY(-6px) scale(0.4); }
          15%  { opacity: 1; transform: translateY(-2px) scale(1); }
          70%  { opacity: 1; transform: translateY(360px) scale(1); }
          85%  { opacity: 0.9; transform: translateY(395px) scale(1.4, 0.7); }
          100% { opacity: 0; transform: translateY(410px) scale(1.8, 0.2); }
        }
        @keyframes whisperIn {
          0%   { opacity: 0; transform: translateY(6px); letter-spacing: 0.5em; }
          100% { opacity: 1; transform: translateY(0);  letter-spacing: 0.22em; }
        }
        @keyframes waterRise {
          0%   { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0%);   opacity: 1; }
        }
        @keyframes ripple {
          0%   { transform: translateX(-50%) scale(0.3); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(2.4); opacity: 0; }
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
          {step === "leaving"  && ""}
          {step === "home"     && "（声：よく ここまできたね）"}
        </p>
      </div>

      <svg viewBox="-200 -200 400 780" width="100%" onClick={handleBloomBackgroundTap}
        style={{
          maxWidth: 360, height: "auto", zIndex: 1,
          transition: "filter 2s ease",
          filter: step === "leaving" ? "brightness(0.78)" : "none",
          cursor: step === "tend" && mode === "grow" ? "pointer" : "default",
        }}>
        <rect x="-200" y="-200" width="400" height="780" fill="transparent" />
        <path d="M 0 110 C -7 240 9 366 -5 470" stroke="#5a6e4a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        <g>
          <defs>
            <linearGradient id="leafGradL" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#3d5a3e" /><stop offset="50%" stopColor="#4d6e4e" /><stop offset="100%" stopColor="#5d8260" />
            </linearGradient>
          </defs>
          <path d="M -2 230 Q -28 194 -52 206 Q -75 204 -88 284 Q -92 326 -80 356 Q -62 374 -42 356 Q -22 332 -8 290 Q -2 266 -2 230 Z"
            fill="url(#leafGradL)" stroke="#2e442c" strokeWidth="0.6" strokeOpacity="0.45" />
          <path d="M -2 254 Q -40 284 -82 314" stroke="#2e442c" strokeWidth="0.7" fill="none" opacity="0.5" />
          <path d="M -18 260 Q -28 284 -34 314" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
          <path d="M -40 272 Q -50 296 -56 332" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
          <path d="M -60 290 Q -70 312 -74 346" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
          {step === "tend" && (
            <text x="-48" y="290" textAnchor="middle"
              fill="rgba(255,255,255,0.88)" fontSize="11"
              fontFamily="'Shippori Mincho', 'Noto Serif JP', serif"
              letterSpacing="0.08em"
              style={{ pointerEvents: "none", userSelect: "none" }}>
              いま{florets.length}輪
            </text>
          )}
        </g>

        <g>
          <defs>
            <linearGradient id="leafGradR" x1="100%" y1="0%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#3d5a3e" /><stop offset="50%" stopColor="#4d6e4e" /><stop offset="100%" stopColor="#5d8260" />
            </linearGradient>
          </defs>
          <path d="M 2 306 Q 28 268 52 284 Q 75 306 88 366 Q 92 408 80 438 Q 62 452 42 434 Q 22 410 8 366 Q 2 342 2 306 Z"
            fill="url(#leafGradR)" stroke="#2e442c" strokeWidth="0.6" strokeOpacity="0.45" />
          <path d="M 2 332 Q 40 362 82 392" stroke="#2e442c" strokeWidth="0.7" fill="none" opacity="0.5" />
          <path d="M 20 338 Q 30 362 36 392" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
          <path d="M 42 350 Q 52 374 58 410" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
          <path d="M 62 368 Q 72 392 76 422" stroke="#2e442c" strokeWidth="0.4" fill="none" opacity="0.35" />
        </g>

        <g style={{
          transformOrigin: "center",
          animation: step === "leaving" ? "breatheIn 5s ease-in-out infinite alternate"
            : step === "awakening" ? "bloomReveal 1.5s ease-out both" : undefined,
        }}>
          {florets.map((f) => (
            <FloretShape key={f.id} floret={f} mode={mode} onTap={removeFloret} useFloatIn={step === "awakening"} />
          ))}
        </g>

        {step === "leaving" && (
          <g>
            <defs>
              <radialGradient id="shizukuGrad" cx="50%" cy="35%" r="60%">
                <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#cfe2f0" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7ca4cc" stopOpacity="0.7" />
              </radialGradient>
            </defs>
            <g style={{ animation: "shizukuFall 3s ease-in 0.4s both", transformOrigin: "0 110px" }}>
              <path d="M 0 100 Q -7 108 -7 116 Q -7 126 0 126 Q 7 126 7 116 Q 7 108 0 100 Z"
                fill="url(#shizukuGrad)" stroke="#a8c8e8" strokeWidth="0.4" strokeOpacity="0.5" />
              <ellipse cx="-2.5" cy="112" rx="1.6" ry="2.4" fill="#ffffff" opacity="0.85" />
            </g>
          </g>
        )}

        {fallenTasks.map((t, i) => {
          const c = PALETTE[i % PALETTE.length];
          const x = -100 + (i % 6) * 34 + (Math.floor(i / 6) % 2) * 17;
          const y = 516 + Math.floor(i / 6) * 14;
          const rot = (i * 47) % 360;
          return <FallenPetal key={t.id} x={x} y={y} inner={c.inner} outer={c.outer} rot={rot} delay={i * 0.15} />;
        })}
      </svg>

      <div style={{ width: "100%", maxWidth: 360, marginTop: "1rem", zIndex: 1 }}>
        {step === "open" && (
          <button type="button" onClick={startIntro} style={btnStyle}>
            ここに いる
          </button>
        )}

        {step === "tend" && (
          <div style={{ animation: "panelReveal 1.5s ease-out both" }}>
            <div style={{
              display: "flex", gap: "0.5rem", marginBottom: "0.8rem",
              background: "rgba(255,255,255,0.35)", padding: "0.35rem", borderRadius: "999px",
            }}>
              <button type="button" onClick={() => setMode("grow")}
                style={{ ...pillStyle, background: mode === "grow" ? accentColor : "transparent", color: mode === "grow" ? "#fff" : "#3a3a3a" }}>
                花びらを 増やす
              </button>
              <button type="button" onClick={() => setMode("remove")}
                style={{ ...pillStyle, background: mode === "remove" ? accentColor : "transparent", color: mode === "remove" ? "#fff" : "#3a3a3a" }}>
                花びらを 消す
              </button>
            </div>
            <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, background: accentColor, color: "#fff" }}>
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
              placeholder="例：あの返信を書く"
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: `1px solid ${accentDeep}`, borderRadius: "999px",
                background: "rgba(255,255,255,0.6)", fontFamily: "inherit",
                fontSize: "1rem", color: "#3a3a3a", outline: "none",
                marginBottom: "0.8rem", boxSizing: "border-box", transition: "all 0.3s ease",
              }} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button"
                onClick={() => {
                  const trimmed = taskInput.trim();
                  if (!trimmed) { inputRef.current?.focus(); return; }
                  setTasks((ts) => [...ts, { id: Date.now(), text: trimmed, done: false }]);
                  setTaskInput("");
                }}
                style={{ ...btnStyle, flex: 1 }}>
                花びらに する
              </button>
              <button type="button" onClick={() => setStep("leaving")} style={{ ...btnStyle, flex: 1, background: accentColor, color: "#fff" }}>
                いってきます
              </button>
            </div>
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

        {/* === Shizuku scene (replaces breath) === */}
        {step === "leaving" && (
          <div className="fade-up" style={{ textAlign: "center" }}>
            {!shizukuDropped && (
              <p style={{
                fontSize: "0.9rem", letterSpacing: "0.22em", color: "#4a5e7a",
                fontStyle: "italic", opacity: 0.7,
                animation: "whisperIn 2.2s ease-out 0.8s both",
              }}>
                花が ひとしずく、代わりに
              </p>
            )}
            {shizukuDropped && (
              <button type="button" onClick={() => setStep("home")}
                style={{ ...btnStyle, animation: "fadeUp 1.2s ease-out both" }}>
                ただいま
              </button>
            )}
          </div>
        )}

        {step === "home" && (
          <div className="fade-up">
            <p style={{ textAlign: "center", color: "#4a4a4a", marginBottom: "0.8rem", fontSize: "0.95rem" }}>
              終わったことを、そっと 下に置きます
            </p>
            <ul style={{ padding: 0, listStyle: "none", fontSize: "0.9rem" }}>
              {tasks.map((t) => (
                <li key={t.id}
                  onClick={() => {
                    if (t.done) return;
                    setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, done: true } : x));
                  }}
                  style={{
                    padding: "0.6rem 0.9rem", marginBottom: "0.4rem",
                    background: t.done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
                    borderRadius: "8px", borderLeft: `3px solid ${accentDeep}`,
                    color: t.done ? "#999" : "#3a3a3a",
                    textDecoration: t.done ? "line-through" : "none",
                    cursor: t.done ? "default" : "pointer", transition: "all 0.6s ease",
                  }}>
                  {t.text}
                  {!t.done && <span style={{ float: "right", fontSize: "0.75rem", opacity: 0.6 }}>タップで置く</span>}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, flex: 1 }}>
                もうひとつ 置く
              </button>
              <button type="button" onClick={() => setStep("reflection")}
                style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.3)" }}>
                とじる
              </button>
            </div>
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
                border: "1px solid rgba(255,255,255,0.6)", borderRadius: "50%",
                animation: "ripple 3.5s ease-out 1.5s infinite", pointerEvents: "none",
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

          <button type="button" onClick={() => setStep("offering")}
            style={{
              position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
              padding: "0.6rem 1.8rem", fontFamily: "inherit",
              fontSize: "0.85rem", letterSpacing: "0.25em",
              background: "transparent", border: "1px solid rgba(45,82,136,0.4)",
              borderRadius: "999px", color: "#2a3a52", cursor: "pointer",
              opacity: 0, animation: "whisperIn 1.4s ease-out 4s forwards",
            }}>
            すすむ
          </button>
        </div>
      )}

      {step === "offering" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(180deg, #c8cdd2 0%, #b8c2cf 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", animation: "fadeUp 1.2s ease-out both",
        }}>
          <p style={{
            position: "absolute", top: "3rem", left: "50%", transform: "translateX(-50%)",
            width: "100%", textAlign: "center",
            fontSize: "0.95rem", letterSpacing: "0.2em", color: "#3a4a62",
            fontStyle: "italic", opacity: 0,
            animation: "whisperIn 1.8s ease-out 0.3s forwards",
          }}>
            この花を、どちらへ
          </p>

          <div style={{
            transform: `rotate(${offeringDir * 22}deg)`,
            transformOrigin: "50% 90%",
            transition: "transform 1.2s cubic-bezier(0.4, 0, 0.4, 1)",
            width: "100%", maxWidth: 280,
          }}>
            <svg viewBox="-120 -180 240 360" width="100%" style={{ display: "block" }}>
              <path d="M 0 100 Q 6 130 -2 170" stroke="#3a4a2c" strokeWidth="3" fill="none" strokeLinecap="round" />
              <g>
                {florets.slice(0, Math.min(florets.length, 28)).map((f, i) => {
                  const c = PALETTE[f.colorIndex];
                  const sx = f.x * 0.7;
                  const sy = f.y * 0.7;
                  return (
                    <g key={f.id} transform={`translate(${sx} ${sy})`}>
                      {[0, 90, 180, 270].map((a) => (
                        <path key={a} d="M 0 0 C 10 -1, 10 -15, 0 -20 C -10 -15, -10 -1, 0 0 Z"
                          transform={`rotate(${a + i * 3})`} fill={c.inner} stroke={c.outer} strokeWidth="0.5" />
                      ))}
                      <circle r="1.6" fill={c.outer} opacity="0.75" />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          <p style={{
            marginTop: "1rem", fontSize: "0.95rem", letterSpacing: "0.25em",
            color: "#2a3a52", fontStyle: "italic", textAlign: "center", minHeight: "1.5em",
            transition: "opacity 0.6s ease",
          }}>
            {offeringDir < 0 && "届かなくても いい"}
            {offeringDir === 0 && "ただ、咲かせた"}
            {offeringDir > 0 && "届けても いい"}
          </p>

          <div style={{
            display: "flex", gap: "0.6rem", marginTop: "1.5rem",
            opacity: 0, animation: "whisperIn 1.4s ease-out 1.5s forwards",
          }}>
            {[
              { val: -1, label: "← ひだり" },
              { val:  0, label: "まんなか" },
              { val:  1, label: "みぎ →" },
            ].map((d) => (
              <button key={d.val} type="button" onClick={() => setOfferingDir(d.val)}
                style={{
                  padding: "0.5rem 1rem", fontFamily: "inherit",
                  fontSize: "0.8rem", letterSpacing: "0.15em",
                  background: offeringDir === d.val ? "#4a78b8" : "rgba(255,255,255,0.5)",
                  color: offeringDir === d.val ? "#fff" : "#3a3a3a",
                  border: "1px solid #2d5288", borderRadius: "999px",
                  cursor: "pointer", transition: "all 0.3s ease",
                }}>
                {d.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setStep("revealing")}
            style={{
              position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
              padding: "0.6rem 1.8rem", fontFamily: "inherit",
              fontSize: "0.85rem", letterSpacing: "0.25em",
              background: "transparent", border: "1px solid rgba(45,82,136,0.4)",
              borderRadius: "999px", color: "#2a3a52", cursor: "pointer",
              opacity: 0, animation: "whisperIn 1.4s ease-out 2.2s forwards",
            }}>
            この向きで
          </button>
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
              fontSize: "1.05rem", letterSpacing: "0.2em",
              color: "#e0e8f0", fontStyle: "italic", lineHeight: 2,
              opacity: 0, animation: "whisperIn 3s ease-out 1.5s forwards",
            }}>
              手放したものは
            </p>
            <p style={{
              fontSize: "1.05rem", letterSpacing: "0.2em",
              color: "#e0e8f0", fontStyle: "italic", lineHeight: 2,
              opacity: 0, animation: "whisperIn 3s ease-out 4s forwards",
            }}>
              消えたのではなく
            </p>
            <p style={{
              fontSize: "1.15rem", letterSpacing: "0.22em",
              color: "#c8d8e8", fontStyle: "italic", lineHeight: 2, marginTop: "0.5rem",
              opacity: 0, animation: "whisperIn 3s ease-out 6.5s forwards",
            }}>
              向こう側に　届いていた
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
            そして
          </button>
        </div>
      )}

      {step === "handover" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(180deg, rgba(200,205,210,0.85) 0%, rgba(180,190,205,0.95) 60%, rgba(160,175,195,0.98) 100%)",
          backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "2rem 1.5rem", animation: "fadeUp 1.4s ease-out both",
        }}>
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
              audio.play().then(() => setAudioPlayed(true)).catch(() => setAudioPlayed(false));
            }}>
            <svg viewBox="-50 -50 100 100" width="120" height="120" style={{
              display: "block",
              animation: !handoverTouched ? "petalGlow 2.8s ease-in-out infinite" : undefined,
              transition: "transform 0.6s ease",
              transform: handoverTouched ? "scale(1.15)" : "scale(1)",
            }}>
              <defs>
                <radialGradient id="handoverGrad" cx="50%" cy="80%" r="90%">
                  <stop offset="0%"  stopColor="#2d5288" />
                  <stop offset="45%" stopColor="#4a78b8" />
                  <stop offset="100%" stopColor="#dcecf4" />
                </radialGradient>
                <radialGradient id="handoverHighlight" cx="50%" cy="25%" r="55%">
                  <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#dcecf4" stopOpacity="0" />
                </radialGradient>
              </defs>
              {[0, 90, 180, 270].map((a) => (
                <g key={a} transform={`rotate(${a})`}>
                  <path d="M 0 0 C 22 -2, 22 -28, 0 -40 C -22 -28, -22 -2, 0 0 Z"
                    fill="url(#handoverGrad)" stroke="#2d5288" strokeWidth="0.6" strokeOpacity="0.5" />
                  <path d="M 0 0 C 22 -2, 22 -28, 0 -40 C -22 -28, -22 -2, 0 0 Z"
                    fill="url(#handoverHighlight)" />
                </g>
              ))}
              <circle r="4" fill="#2d5288" opacity="0.85" />
              <circle r="1.5" fill="#fff8d8" opacity="0.7" />
            </svg>
          </div>

          <div style={{
            position: "absolute",
            top: "calc(50% + 100px)", left: "50%", transform: "translateX(-50%)",
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
                marginTop: "1.5rem", fontSize: "0.78rem",
                letterSpacing: "0.22em", color: "#4a5e7a",
                opacity: 0,
                animation: "whisperIn 1.4s ease-out 0.3s forwards",
                fontStyle: "italic",
              }}>
                {audioPlayed ? "（声が ここに）" : "受け取ったね"}
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
            おわり
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