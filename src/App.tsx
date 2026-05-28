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

// ---------- A single floret's data ----------
type Floret = {
  id: number;
  x: number;
  y: number;
  r: number;
  rot: number;
  seed: number;
  colorIndex: number;
  born: number; // timestamp, used to animate new florets in
};

const MAX_FLORETS = 60;

// Generate a position on a spiral so new florets fill the bloom naturally
// (phyllotaxis / sunflower spiral keeps the cluster looking organic).
function positionForIndex(i: number): { x: number; y: number; r: number; rot: number } {
  const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle
  const a = i * golden;
  // radius grows with sqrt(i) so florets spread evenly, capped to keep a tight手毬
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
function makeFloret(index: number): Floret {
  const p = positionForIndex(index);
  return {
    id: floretCounter++,
    x: p.x,
    y: p.y,
    r: p.r,
    rot: p.rot,
    seed: index + 1,
    colorIndex: index % PALETTE.length,
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

// ---------- Single hydrangea floret (4 teardrop petals in a cross) ----------
function FloretShape({
  floret, mode, onTap, useFloatIn = false,
}: {
  floret: Floret;
  mode: GrowMode;
  onTap: (id: number) => void;
  useFloatIn?: boolean;
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
    <g
      transform={`translate(${cx} ${cy}) rotate(${rot})`}
      onClick={(e) => { e.stopPropagation(); onTap(floret.id); }}
      style={{
        cursor: mode === "remove" ? "pointer" : "default",
        transformOrigin: "center",
        transformBox: "fill-box",
        animation: isFloating
          ? "floretFloatIn 2.8s ease-out both"
          : isNew
            ? "floretBloom 0.7s ease-out both"
            : undefined,
      }}
    >
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

      {/* In "remove" mode, a faint ring hints the floret is tappable */}
      {mode === "remove" && (
        <circle r={s * 1.15} fill="none" stroke={outer} strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="2 3" />
      )}

      {[0, 90, 180, 270].map((a, i) => {
        const jitterA = (rand(i) - 0.5) * 14;
        const w = s * (0.68 + rand(i + 1) * 0.18);
        const h = s * (0.92 + rand(i + 2) * 0.22);
        const skew = (rand(i + 3) - 0.5) * 0.15;
        const path = `
          M 0 0
          C ${w * 0.55} ${-h * 0.05},
            ${w * (0.55 + skew)} ${-h * 0.65},
            ${skew * w * 0.5} ${-h}
          C ${-w * (0.55 - skew)} ${-h * 0.65},
            ${-w * 0.55} ${-h * 0.05},
            0 0
          Z
        `;
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

// ---------- A petal that has fallen at the base ----------
function FallenPetal({
  x, y, inner, outer, rot, delay,
}: {
  x: number; y: number; inner: string; outer: string; rot: number; delay: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot})`}
      style={{ opacity: 0, animation: `petalSettle 1.6s ease-out ${delay}s forwards` }}
    >
      <ellipse rx="15" ry="10.5" fill={inner} opacity="0.85" />
      <ellipse rx="15" ry="10.5" fill="none" stroke={outer} strokeWidth="0.5" />
    </g>
  );
}

// ============================================================
//  Main App
// ============================================================
type Step = "open" | "awakening" | "tend" | "task" | "leaving" | "home";
type GrowMode = "grow" | "remove";

export default function App() {
  const [step, setStep] = useState<Step>("open");
  const [florets, setFlorets] = useState<Floret[]>(seedBloom);
  const [mode, setMode] = useState<GrowMode>("grow");
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [breathPhase, setBreathPhase] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // re-render tick so bloom animations resolve cleanly
  const [, force] = useState(0);
  useEffect(() => {
    if (step !== "tend" && step !== "awakening") return;
    const id = setInterval(() => force((n) => n + 1), 80);
    return () => clearInterval(id);
  }, [step]);

  // after intro bloom, gently move to tend
  useEffect(() => {
    if (step !== "awakening") return;
    const id = setTimeout(() => setStep("tend"), INTRO_BLOOM_MS + INTRO_TO_TEND_MS);
    return () => clearTimeout(id);
  }, [step]);

  // Breath cycle on "leaving" screen
  useEffect(() => {
    if (step !== "leaving") return;
    setBreathPhase(0);
    const id = setInterval(() => {
      setBreathPhase((p) => {
        if (p >= 3) { clearInterval(id); return p; }
        return p + 1;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [step]);

  const activeTasks = tasks.filter((t) => !t.done);
  const fallenTasks = tasks.filter((t) => t.done);
  const accentColor = "#4a78b8";
  const accentDeep  = "#2d5288";

  // ----- grow / remove handlers -----
  const addFloret = () => {
    setFlorets((fs) => {
      if (fs.length >= MAX_FLORETS) return fs;
      return [...fs, makeFloret(fs.length)];
    });
  };

  const removeFloret = (id: number) => {
    if (mode !== "remove") return;
    setFlorets((fs) => {
      const next = fs.filter((f) => f.id !== id);
      // re-flow positions so the bloom stays a tight手毬 after removal
      return next.map((f, i) => {
        const p = positionForIndex(i);
        return { ...f, x: p.x, y: p.y, r: p.r, rot: p.rot };
      });
    });
  };

  // tapping empty space in grow mode adds a floret
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
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Shippori Mincho', 'Noto Serif JP', 'Hiragino Mincho ProN', serif",
        background: "linear-gradient(180deg, #cbcdd2 0%, #d8dde2 60%, #c8cdd2 100%)",
        transition: "background 2s ease",
        color: "#3a3a3a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "2rem 1rem 3rem",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Drifting cloud layer */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.5), transparent 50%)," +
            "radial-gradient(ellipse at 75% 25%, rgba(255,255,255,0.4), transparent 55%)," +
            "radial-gradient(ellipse at 50% 8%, rgba(255,255,255,0.35), transparent 60%)",
          animation: "cloudDrift 60s ease-in-out infinite alternate",
        }}
      />

      <style>{`
        @keyframes cloudDrift {
          0%   { transform: translateX(-3%); }
          100% { transform: translateX(3%); }
        }
        @keyframes petalSettle {
          0%   { opacity: 0; transform: translate(0px, -80px) rotate(0deg) scale(0.6); }
          70%  { opacity: 0.9; }
          100% { opacity: 0.85; transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes floretBloom {
          0%   { opacity: 0; transform: scale(0.2); }
          60%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes floretFloatIn {
          0%   { opacity: 0; transform: scale(0.12) translateY(18px); }
          35%  { opacity: 0.55; transform: scale(0.85) translateY(-6px); }
          65%  { opacity: 0.92; transform: scale(1.1) translateY(3px); }
          85%  { opacity: 1; transform: scale(0.97) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes panelReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bloomReveal {
          from { opacity: 0.85; }
          to   { opacity: 1; }
        }
        @keyframes breatheIn {
          0%   { transform: scale(1);    opacity: 0.85; }
          100% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
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

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "0.5rem", textAlign: "center", zIndex: 1 }}>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.3em",
          margin: 0, fontStyle: "italic", color: "#3a3a3a",
        }}>
          the water vessel
        </h1>
        <p className="voice-line" style={{ marginTop: "0.4rem" }}>
          {step === "open"      && "（声：今日もここにあるよ）"}
          {step === "awakening" && ""}
          {step === "tend"      && (mode === "grow" ? "空いたところを そっと 押すと、咲きます" : "花びらを 押すと、ひとつ 手放せます")}
          {step === "task"    && ""}
          {step === "leaving" && "（声：重いまま、いっていいよ）"}
          {step === "home"    && "（声：よく ここまできたね）"}
        </p>
      </div>

      {/* The flower */}
      <svg
        viewBox="-200 -200 400 780"
        width="100%"
        onClick={handleBloomBackgroundTap}
        style={{
          maxWidth: 360, height: "auto", zIndex: 1,
          transition: "filter 2s ease",
          filter: step === "leaving" ? "brightness(0.78)" : "none",
          cursor: step === "tend" && mode === "grow" ? "pointer" : "default",
        }}
      >
        {/* transparent backdrop to catch "grow" taps on empty space */}
        <rect x="-200" y="-200" width="400" height="780" fill="transparent" />

        {/* stem */}
        <path
          d="M 0 110 C -7 240 9 366 -5 470"
          stroke="#5a6e4a"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left leaf */}
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
            <text
              x="-48"
              y="290"
              textAnchor="middle"
              fill="rgba(255,255,255,0.88)"
              fontSize="11"
              fontFamily="'Shippori Mincho', 'Noto Serif JP', serif"
              letterSpacing="0.08em"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              いま{florets.length}輪
            </text>
          )}
        </g>

        {/* Right leaf */}
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

        {/* The bloom — dynamic florets */}
        <g style={{
          transformOrigin: "center",
          animation: step === "leaving"
            ? "breatheIn 5s ease-in-out infinite alternate"
            : step === "awakening"
              ? "bloomReveal 1.5s ease-out both"
              : undefined,
        }}>
          {florets.map((f) => (
            <FloretShape
              key={f.id}
              floret={f}
              mode={mode}
              onTap={removeFloret}
              useFloatIn={step === "awakening"}
            />
          ))}
        </g>

        {/* Fallen petals at the base */}
        {fallenTasks.map((t, i) => {
          const c = PALETTE[i % PALETTE.length];
          const x = -100 + (i % 6) * 34 + (Math.floor(i / 6) % 2) * 17;
          const y = 516 + Math.floor(i / 6) * 14;
          const rot = (i * 47) % 360;
          return <FallenPetal key={t.id} x={x} y={y} inner={c.inner} outer={c.outer} rot={rot} delay={i * 0.15} />;
        })}
      </svg>

      {/* Interaction panel */}
      <div style={{ width: "100%", maxWidth: 360, marginTop: "1rem", zIndex: 1 }}>
        {step === "open" && (
          <button type="button" onClick={startIntro} style={btnStyle}>
            ここに いる
          </button>
        )}

        {step === "tend" && (
          <div style={{ animation: "panelReveal 1.5s ease-out both" }}>
            {/* mode switch — always visible operation panel */}
            <div style={{
              display: "flex", gap: "0.5rem", marginBottom: "0.8rem",
              background: "rgba(255,255,255,0.35)", padding: "0.35rem",
              borderRadius: "999px",
            }}>
              <button
                type="button"
                onClick={() => setMode("grow")}
                style={{
                  ...pillStyle,
                  background: mode === "grow" ? accentColor : "transparent",
                  color: mode === "grow" ? "#fff" : "#3a3a3a",
                }}
              >
                花びらを 増やす
              </button>
              <button
                type="button"
                onClick={() => setMode("remove")}
                style={{
                  ...pillStyle,
                  background: mode === "remove" ? accentColor : "transparent",
                  color: mode === "remove" ? "#fff" : "#3a3a3a",
                }}
              >
                花びらを 消す
              </button>
            </div>

            {mode === "grow" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.8rem" }}>
                <button
                  type="button"
                  onClick={addFloret}
                  disabled={florets.length >= MAX_FLORETS}
                  style={{
                    ...pillStyle, flex: "0 0 auto", padding: "0.4rem 1rem",
                    background: florets.length >= MAX_FLORETS ? "rgba(200,200,200,0.4)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${accentDeep}`,
                    cursor: florets.length >= MAX_FLORETS ? "default" : "pointer",
                  }}
                >
                  + ひとつ 咲かせる
                </button>
              </div>
            )}

            <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, background: accentColor, color: "#fff" }}>
              この花で、すすむ
            </button>
          </div>
        )}

        {step === "task" && (
          <div className="fade-up">
            <input
              ref={inputRef}
              type="text"
              value={taskInput}
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
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  const trimmed = taskInput.trim();
                  if (!trimmed) { inputRef.current?.focus(); return; }
                  setTasks((ts) => [...ts, { id: Date.now(), text: trimmed, done: false }]);
                  setTaskInput("");
                }}
                style={{ ...btnStyle, flex: 1 }}
              >
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

        {step === "leaving" && (
          <div className="fade-up" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1rem", letterSpacing: "0.15em", color: "#4a4a4a", marginBottom: "1.2rem" }}>
              {breathPhase === 0 && "ひとつめの 息"}
              {breathPhase === 1 && "ふたつめの 息"}
              {breathPhase === 2 && "みっつめの 息"}
              {breathPhase >= 3 && "いってらっしゃい"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginBottom: "1.2rem" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i <= breathPhase - 1 ? accentDeep : "rgba(255,255,255,0.5)",
                  border: `1px solid ${accentDeep}`, transition: "background 0.6s ease",
                }} />
              ))}
            </div>
            {breathPhase >= 3 && (
              <button type="button" onClick={() => setStep("home")} style={btnStyle}>
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
                <li
                  key={t.id}
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
                  }}
                >
                  {t.text}
                  {!t.done && <span style={{ float: "right", fontSize: "0.75rem", opacity: 0.6 }}>タップで置く</span>}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, flex: 1 }}>
                もうひとつ 置く
              </button>
              <button
                type="button"
                onClick={() => { setFlorets(seedBloom()); setStep("open"); }}
                style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.3)" }}
              >
                とじる
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ---------- Shared styles ----------
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