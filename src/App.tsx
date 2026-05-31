import { useState, useEffect, useRef } from "react";

// ============================================================
//  the water vessel
//  A small witnessing app — a hydrangea that holds your day.
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

// ---------- Mood options ----------
type Mood = { id: string; label: string; sky: string };
const MOODS: Mood[] = [
  { id: "heavy",    label: "重い",     sky: "#b8bdc8" },
  { id: "moya",     label: "モヤモヤ", sky: "#c2c5cf" },
  { id: "zawa",     label: "ザワザワ", sky: "#c8c2cd" },
  { id: "shindoi",  label: "しんどい", sky: "#bdc5cc" },
  { id: "bonyari",  label: "ぼんやり", sky: "#cccdd1" },
  { id: "kanashii", label: "かなしい", sky: "#c0c6d0" },
];

// ---------- Densely packed petal positions ----------
const PETAL_POSITIONS: { x: number; y: number; r: number; rot: number; seed: number }[] = (() => {
  const arr: { x: number; y: number; r: number; rot: number; seed: number }[] = [];
  let seed = 1;

  // Outer ring — 12 florets
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const jx = Math.sin(seed * 1.7) * 6;
    const jy = Math.cos(seed * 2.3) * 6;
    arr.push({
      x: Math.cos(a) * 78 + jx,
      y: Math.sin(a) * 78 + jy,
      r: 24 + (seed % 3),
      rot: (a * 180) / Math.PI + 90,
      seed: seed++,
    });
  }

  // Middle ring — 10 florets
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + 0.3;
    const jx = Math.sin(seed * 1.7) * 5;
    const jy = Math.cos(seed * 2.3) * 5;
    arr.push({
      x: Math.cos(a) * 46 + jx,
      y: Math.sin(a) * 46 + jy,
      r: 23 + (seed % 3),
      rot: (a * 180) / Math.PI + 60,
      seed: seed++,
    });
  }

  // Inner ring — 6 florets
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + 0.6;
    arr.push({
      x: Math.cos(a) * 22,
      y: Math.sin(a) * 22,
      r: 22 + (seed % 2),
      rot: (a * 180) / Math.PI + 30,
      seed: seed++,
    });
  }

  // Center — 2 florets
  arr.push({ x: 0,  y: 0, r: 22, rot: 15, seed: seed++ });
  arr.push({ x: -6, y: 8, r: 21, rot: 80, seed: seed++ });

  return arr;
})();

// ---------- Single hydrangea floret (4 teardrop petals in a cross) ----------
function Floret({
  cx, cy, size, rot, inner, outer, tip, seed,
}: {
  cx: number; cy: number; size: number; rot: number;
  inner: string; outer: string; tip: string; seed: number;
}) {
  const s = size * 0.62;
  const rand = (n: number) => {
    const x = Math.sin(seed * 9.7 + n * 3.1) * 10000;
    return x - Math.floor(x);
  };
  const gradId = `pg-${seed}`;
  const tipGradId = `pt-${seed}`;

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
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
            <path
              d={path}
              fill={`url(#${gradId})`}
              stroke={outer}
              strokeWidth="0.5"
              strokeOpacity="0.45"
            />
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
      style={{
        opacity: 0,
        animation: `petalSettle 1.6s ease-out ${delay}s forwards`,
      }}
    >
      <ellipse rx="10" ry="7" fill={inner} opacity="0.85" />
      <ellipse rx="10" ry="7" fill="none" stroke={outer} strokeWidth="0.5" />
    </g>
  );
}

// ============================================================
//  Main App
// ============================================================
type Step = "open" | "mood" | "task" | "leaving" | "home";

export default function App() {
  const [step, setStep] = useState<Step>("open");
  const [mood, setMood] = useState<Mood | null>(null);
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [breathPhase, setBreathPhase] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const skyColor = mood?.sky ?? "#cbcdd2";
  const accentColor = "#4a78b8";   // signature blue
  const accentDeep  = "#2d5288";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Shippori Mincho', 'Noto Serif JP', 'Hiragino Mincho ProN', serif",
        background: `linear-gradient(180deg, ${skyColor} 0%, #d8dde2 60%, #c8cdd2 100%)`,
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
          font-style: italic;
          color: #5a5a5a;
          letter-spacing: 0.05em;
          font-size: 0.85rem;
          opacity: 0.75;
          min-height: 1.2em;
        }
        input:focus {
          border-color: ${accentDeep} !important;
          background: rgba(255,255,255,0.75) !important;
        }
        button:hover {
          background: rgba(255,255,255,0.75) !important;
        }
      `}</style>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "0.5rem", textAlign: "center", zIndex: 1 }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 300,
          letterSpacing: "0.3em",
          margin: 0,
          fontStyle: "italic",
          color: "#3a3a3a",
        }}>
          the water vessel
        </h1>
        <p className="voice-line" style={{ marginTop: "0.4rem" }}>
          {step === "open"     && "（声：今日もここにあるよ）"}
          {step === "mood"     && "今日は どんな色？"}
          {step === "task"     && ""}
          {step === "leaving"  && "（声：重いまま、いっていいよ）"}
          {step === "home"     && "（声：よく ここまできたね）"}
        </p>
      </div>

      {/* The flower */}
      <svg
        viewBox="-200 -200 400 460"
        width="100%"
        style={{
          maxWidth: 360,
          height: "auto",
          zIndex: 1,
          transition: "filter 2s ease",
          filter: step === "leaving" ? "brightness(0.78)" : "none",
        }}
      >
        {/* stem */}
        <path
          d="M 0 110 Q -3 160 -1 230"
          stroke="#3a4a2c"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left leaf */}
        <g>
          <defs>
            <linearGradient id="leafGradL" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%"   stopColor="#1f3320" />
              <stop offset="50%"  stopColor="#2f4a30" />
              <stop offset="100%" stopColor="#3d5e3d" />
            </linearGradient>
          </defs>
          <path
            d="M -2 150
               Q -28 138 -52 142
               Q -75 148 -88 168
               Q -92 182 -80 192
               Q -62 198 -42 192
               Q -22 184 -8 170
               Q -2 162 -2 150 Z"
            fill="url(#leafGradL)"
            stroke="#1a2818"
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
          <path d="M -2 158 Q -40 168 -82 178" stroke="#1a2818" strokeWidth="0.7" fill="none" opacity="0.6" />
          <path d="M -18 160 Q -28 168 -34 178" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d="M -40 164 Q -50 172 -56 184" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d="M -60 170 Q -70 178 -74 188" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
        </g>

        {/* Right leaf */}
        <g>
          <defs>
            <linearGradient id="leafGradR" x1="100%" y1="0%" x2="0%" y2="50%">
              <stop offset="0%"   stopColor="#1f3320" />
              <stop offset="50%"  stopColor="#2f4a30" />
              <stop offset="100%" stopColor="#3d5e3d" />
            </linearGradient>
          </defs>
          <path
            d="M 2 175
               Q 28 163 52 168
               Q 75 175 88 195
               Q 92 209 80 219
               Q 62 224 42 218
               Q 22 210 8 195
               Q 2 187 2 175 Z"
            fill="url(#leafGradR)"
            stroke="#1a2818"
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
          <path d="M 2 184 Q 40 194 82 204" stroke="#1a2818" strokeWidth="0.7" fill="none" opacity="0.6" />
          <path d="M 20 186 Q 30 194 36 204" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d="M 42 190 Q 52 198 58 210" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d="M 62 196 Q 72 204 76 214" stroke="#1a2818" strokeWidth="0.4" fill="none" opacity="0.4" />
        </g>

        {/* The bloom — 30 packed florets */}
        <g
          style={{
            transformOrigin: "center",
            animation: step === "leaving" ? "breatheIn 5s ease-in-out infinite alternate" : undefined,
          }}
        >
          {PETAL_POSITIONS.map((p, i) => {
            const c = PALETTE[i % PALETTE.length];
            return (
              <Floret
                key={i}
                cx={p.x}
                cy={p.y}
                size={p.r}
                rot={p.rot}
                seed={p.seed}
                inner={c.inner}
                outer={c.outer}
                tip={c.tip}
              />
            );
          })}
        </g>

        {/* Fallen petals at the base */}
        {fallenTasks.map((t, i) => {
          const c = PALETTE[i % PALETTE.length];
          const x = -100 + (i % 6) * 34 + (Math.floor(i / 6) % 2) * 17;
          const y = 245 + Math.floor(i / 6) * 14;
          const rot = (i * 47) % 360;
          return (
            <FallenPetal
              key={t.id}
              x={x}
              y={y}
              inner={c.inner}
              outer={c.outer}
              rot={rot}
              delay={i * 0.15}
            />
          );
        })}
      </svg>

      {/* Interaction panel */}
      <div style={{ width: "100%", maxWidth: 360, marginTop: "1rem", zIndex: 1 }}>
        {step === "open" && (
          <button type="button" onClick={() => setStep("mood")} style={btnStyle}>
            ここに いる
          </button>
        )}

        {step === "mood" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMood(m);
                  setTimeout(() => setStep("task"), 900);
                }}
                style={{
                  ...btnStyle,
                  background: mood?.id === m.id ? accentColor : "rgba(255,255,255,0.55)",
                  color: mood?.id === m.id ? "#fff" : "#3a3a3a",
                  borderColor: accentDeep,
                }}
              >
                {m.label}
              </button>
            ))}
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
                width: "100%",
                padding: "0.8rem 1rem",
                border: `1px solid ${accentDeep}`,
                borderRadius: "999px",
                background: "rgba(255,255,255,0.6)",
                fontFamily: "inherit",
                fontSize: "1rem",
                color: "#3a3a3a",
                outline: "none",
                marginBottom: "0.8rem",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  const trimmed = taskInput.trim();
                  if (!trimmed) {
                    inputRef.current?.focus();
                    return;
                  }
                  setTasks((ts) => [...ts, { id: Date.now(), text: trimmed, done: false }]);
                  setTaskInput("");
                }}
                style={{ ...btnStyle, flex: 1 }}
              >
                花びらに する
              </button>
              <button
                type="button"
                onClick={() => setStep("leaving")}
                style={{ ...btnStyle, flex: 1, background: accentColor, color: "#fff" }}
              >
                いってきます
              </button>
            </div>

            {activeTasks.length > 0 && (
              <ul style={{ marginTop: "1rem", padding: 0, listStyle: "none", fontSize: "0.9rem" }}>
                {activeTasks.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      padding: "0.5rem 0.8rem",
                      marginBottom: "0.3rem",
                      background: "rgba(255,255,255,0.4)",
                      borderRadius: "8px",
                      borderLeft: `3px solid ${accentDeep}`,
                    }}
                  >
                    {t.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === "leaving" && (
          <div className="fade-up" style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "1rem",
              letterSpacing: "0.15em",
              color: "#4a4a4a",
              marginBottom: "1.2rem",
            }}>
              {breathPhase === 0 && "ひとつめの 息"}
              {breathPhase === 1 && "ふたつめの 息"}
              {breathPhase === 2 && "みっつめの 息"}
              {breathPhase >= 3 && "いってらっしゃい"}
            </p>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.4rem",
              marginBottom: "1.2rem",
            }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: i <= breathPhase - 1 ? accentDeep : "rgba(255,255,255,0.5)",
                    border: `1px solid ${accentDeep}`,
                    transition: "background 0.6s ease",
                  }}
                />
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
            <p style={{
              textAlign: "center",
              color: "#4a4a4a",
              marginBottom: "0.8rem",
              fontSize: "0.95rem",
            }}>
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
                    padding: "0.6rem 0.9rem",
                    marginBottom: "0.4rem",
                    background: t.done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
                    borderRadius: "8px",
                    borderLeft: `3px solid ${accentDeep}`,
                    color: t.done ? "#999" : "#3a3a3a",
                    textDecoration: t.done ? "line-through" : "none",
                    cursor: t.done ? "default" : "pointer",
                    transition: "all 0.6s ease",
                  }}
                >
                  {t.text}
                  {!t.done && (
                    <span style={{ float: "right", fontSize: "0.75rem", opacity: 0.6 }}>
                      タップで置く
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="button" onClick={() => setStep("task")} style={{ ...btnStyle, flex: 1 }}>
                もうひとつ 置く
              </button>
              <button
                type="button"
                onClick={() => setStep("open")}
                style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.3)" }}
              >
                とじる
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{
        marginTop: "auto",
        paddingTop: "2rem",
        fontSize: "0.7rem",
        opacity: 0.45,
        letterSpacing: "0.2em",
        zIndex: 1,
      }}>
        witnessing, not advising
      </p>
    </div>
  );
}

// ---------- Shared button style ----------
const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 1.2rem",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  letterSpacing: "0.15em",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid #2d5288",
  borderRadius: "999px",
  color: "#3a3a3a",
  cursor: "pointer",
  transition: "all 0.4s ease",
  backdropFilter: "blur(4px)",
};