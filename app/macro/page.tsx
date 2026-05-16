"use client"

import { useEffect, useState } from "react"

const API_URL = "https://testapi.calai.app/v6/admin/marketing/integration"

type MacroData = {
  date: string
  streak: number
  goals: { kcal: number; p: number; c: number; f: number }
  consumed: { kcal: number; p: number; c: number; f: number }
  remaining: { kcal: number; p: number; c: number; f: number }
  week: { label: string; date: number; active: boolean }[]
  meals: { time: string; name: string; kcal: number; p: number; c: number; f: number }[]
  __offline?: boolean
}

const FALLBACK: MacroData = {
  date: "2026-05-15",
  streak: 38,
  goals: { kcal: 2310, p: 220, c: 200, f: 70 },
  consumed: { kcal: 1944, p: 195, c: 178, f: 58 },
  remaining: { kcal: 366, p: 25, c: 22, f: 12 },
  week: [
    { label: "SUN", date: 10, active: false },
    { label: "MON", date: 11, active: false },
    { label: "TUE", date: 12, active: false },
    { label: "WED", date: 13, active: false },
    { label: "THU", date: 14, active: false },
    { label: "FRI", date: 15, active: true },
    { label: "SAT", date: 16, active: false },
  ],
  meals: [
    { time: "15:15", name: "PEANUT BUTTER", kcal: 100, p: 4, c: 3, f: 8 },
    { time: "15:45", name: "GREEK YOGURT · ALMONDS", kcal: 294, p: 28, c: 14, f: 14 },
    { time: "12:30", name: "CHICKEN BOWL · RICE · PEPPERS", kcal: 626, p: 55, c: 70, f: 14 },
    { time: "08:10", name: "EGG WHITES + OATS + BERRIES", kcal: 414, p: 38, c: 52, f: 6 },
    { time: "06:45", name: "WHEY ISOLATE + CREATINE", kcal: 137, p: 28, c: 4, f: 1 },
  ],
}

const fmt = (n: number) => Number(n ?? 0).toLocaleString()

function Ring({
  value,
  max,
  size,
  stroke,
  color,
  glow,
  children,
}: {
  value: number
  max: number
  size: number
  stroke: number
  color: string
  glow?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, max > 0 ? value / max : 0)
  const offset = circ * (1 - pct)
  return (
    <div
      className="ring-wrap"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          filter: glow ? `drop-shadow(0 0 10px ${glow})` : "none",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#142a40"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="icon">{children}</div>
    </div>
  )
}

function FlameIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  )
}

export default function MacroDashboard() {
  const [data, setData] = useState<MacroData>(FALLBACK)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          cache: "no-store",
        })
        if (!res.ok) throw new Error("http " + res.status)
        const json = (await res.json()) as MacroData
        if (!cancelled) setData(json)
      } catch (err) {
        console.warn("[macros] fetch failed, using fallback:", err)
        if (!cancelled) setData({ ...FALLBACK, __offline: true })
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const pct =
    data.goals.kcal > 0
      ? Math.round((data.consumed.kcal / data.goals.kcal) * 100)
      : 0

  return (
    <>
      <style>{CSS}</style>
      <div className="macro-app">
        {/* HEADER */}
        <div className="header">
          <div className="prompt">
            <span className="user">root@biomonitor</span>
            <span className="sep">:</span>
            <span>~/macros</span>
            <span className="sep">$</span>
            <span className="cmd">cal-ai --kiosk --4k</span>
          </div>
          <div className={`status${data.__offline ? " offline" : ""}`}>
            <span className="dot" />
            <span className="label">NUTRITION FEED ACTIVE</span>
          </div>
        </div>

        {/* WEEK STRIP */}
        <div className="week">
          {data.week.map((d) => (
            <div key={d.label} className={`day${d.active ? " active" : ""}`}>
              <span className="lbl">{d.label}</span>
              <div className="circle">{String(d.date).padStart(2, "0")}</div>
            </div>
          ))}
        </div>

        {/* CALORIE PANEL */}
        <div className="panel">
          <div>
            <div className="big">{fmt(data.remaining.kcal)}</div>
            <div className="row">
              <span className="kcal-lbl">KCAL LEFT</span>
              <span className="pill">
                <FlameIcon size={12} />
                <span>{data.streak ?? 0}D STREAK</span>
              </span>
            </div>
            <div className="meta">
              {fmt(data.consumed.kcal)} / {fmt(data.goals.kcal)} CONSUMED · {pct}% OF GOAL
            </div>
          </div>
          <Ring
            value={data.consumed.kcal}
            max={data.goals.kcal}
            size={220}
            stroke={14}
            color="#38b6ff"
            glow="rgba(56,182,255,0.5)"
          >
            <svg
              width={64}
              height={64}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38b6ff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(56,182,255,0.6))" }}
            >
              <path d="M12 2.5c1.2 3 4.5 4.5 4.5 8.5a4.5 4.5 0 1 1-9 0c0-2 1-3 1.8-3.6.4 1.2 1.4 1.6 1.4 1.6-.4-2.5.5-5.5 1.3-6.5Z" />
              <path d="M10.5 16a2 2 0 1 0 3 0" />
            </svg>
          </Ring>
        </div>

        {/* MACROS */}
        <div className="macros">
          <div className="macro protein">
            <div>
              <div className="num">
                <span className="v">{data.remaining.p}</span>
                <span className="u">G</span>
              </div>
              <div className="lbl">PROTEIN LEFT</div>
              <div className="sub">
                {data.consumed.p} / {data.goals.p} G
              </div>
            </div>
            <Ring
              value={data.consumed.p}
              max={data.goals.p}
              size={130}
              stroke={8}
              color="#00d4a3"
              glow="rgba(0,212,163,0.55)"
            >
              <svg
                width={42}
                height={42}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00d4a3"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,212,163,0.55))" }}
              >
                <path d="M3 9v6" />
                <path d="M6 6v12" />
                <path d="M18 6v12" />
                <path d="M21 9v6" />
                <path d="M6 12h12" />
              </svg>
            </Ring>
          </div>

          <div className="macro carbs hl">
            <div>
              <div className="num">
                <span className="v">{data.remaining.c}</span>
                <span className="u">G</span>
              </div>
              <div className="lbl">CARBS LEFT</div>
              <div className="sub">
                {data.consumed.c} / {data.goals.c} G
              </div>
            </div>
            <Ring
              value={data.consumed.c}
              max={data.goals.c}
              size={130}
              stroke={8}
              color="#ffc24a"
              glow="rgba(255,194,74,0.55)"
            >
              <svg
                width={42}
                height={42}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffc24a"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,194,74,0.55))" }}
              >
                <path d="M12 22V8" />
                <path d="M12 8c-2-1-3-3-3-5 2 0 4 1 5 3" />
                <path d="M12 8c2-1 3-3 3-5-2 0-4 1-5 3" />
                <path d="M12 13c-2-1-3-3-3-5 2 0 4 1 5 3" />
                <path d="M12 13c2-1 3-3 3-5-2 0-4 1-5 3" />
                <path d="M12 18c-2-1-3-3-3-5 2 0 4 1 5 3" />
                <path d="M12 18c2-1 3-3 3-5-2 0-4 1-5 3" />
              </svg>
            </Ring>
          </div>

          <div className="macro fat">
            <div>
              <div className="num">
                <span className="v">{data.remaining.f}</span>
                <span className="u">G</span>
              </div>
              <div className="lbl">FAT LEFT</div>
              <div className="sub">
                {data.consumed.f} / {data.goals.f} G
              </div>
            </div>
            <Ring
              value={data.consumed.f}
              max={data.goals.f}
              size={130}
              stroke={8}
              color="#3ec5e3"
              glow="rgba(62,197,227,0.55)"
            >
              <svg
                width={42}
                height={42}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3ec5e3"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(62,197,227,0.55))" }}
              >
                <path d="M12 3.5c2.5 3.5 6 6.5 6 10a6 6 0 1 1-12 0c0-3.5 3.5-6.5 6-10Z" />
              </svg>
            </Ring>
          </div>
        </div>

        {/* RECENTLY LOGGED */}
        <section className="logged">
          <header>
            <h2>RECENTLY LOGGED</h2>
            <span className="count">{data.meals.length} ITEMS</span>
          </header>
          <ul>
            {data.meals.length ? (
              data.meals.map((m, i) => (
                <li key={`${m.time}-${i}`}>
                  <span className="time">{m.time}</span>
                  <div>
                    <div className="name">{m.name}</div>
                    <div className="meta">
                      <span className="kcal">
                        <FlameIcon size={11} />
                        {m.kcal} KCAL
                      </span>
                      <span className="p">P {m.p}G</span>
                      <span className="c">C {m.c}G</span>
                      <span className="f">F {m.f}G</span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <span className="time">--:--</span>
                <div>
                  <div className="name" style={{ color: "var(--macro-subtle)" }}>
                    NO ITEMS LOGGED TODAY
                  </div>
                </div>
              </li>
            )}
          </ul>
        </section>

        {/* FOOTER */}
        <div className="footer">
          <span>
            <span className="live">●</span> LIVE FOOD-LOG · <span>{data.date}</span>
          </span>
          <span>BIOMONITOR v2.4 · NUTRITION MODULE · ENCRYPTED</span>
        </div>
      </div>
    </>
  )
}

const CSS = `
  .macro-app {
    --macro-bg: #000000;
    --macro-fg: #aedbff;
    --macro-muted: #6aabd9;
    --macro-subtle: #4f7da3;
    --macro-card: rgba(4, 16, 28, 0.4);
    --macro-border: #14293f;
    --macro-accent: #38b6ff;
    --macro-protein: #00d4a3;
    --macro-carbs: #ffc24a;
    --macro-fat: #3ec5e3;

    min-height: 100vh;
    padding: 1.6vh;
    display: flex;
    flex-direction: column;
    gap: 1.2vh;
    background: var(--macro-bg);
    color: var(--macro-fg);
    font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background-image:
      linear-gradient(rgba(56, 182, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 182, 255, 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    position: relative;
  }
  .macro-app *,
  .macro-app *::before,
  .macro-app *::after { box-sizing: border-box; }

  .macro-app::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.18) 3px
    );
    z-index: 50;
    mix-blend-mode: multiply;
  }

  .macro-app .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1vh;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .macro-app .prompt { display: flex; align-items: center; gap: 6px; color: var(--macro-muted); }
  .macro-app .prompt .user { color: var(--macro-accent); }
  .macro-app .prompt .sep { color: var(--macro-subtle); }
  .macro-app .prompt .cmd { color: var(--macro-fg); }
  .macro-app .prompt .cmd::after {
    content: "_";
    margin-left: 2px;
    color: var(--macro-accent);
    animation: macro-blink 1s steps(1) infinite;
  }
  @keyframes macro-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }

  .macro-app .status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--macro-protein);
  }
  .macro-app .status.offline { color: var(--macro-subtle); }
  .macro-app .status .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--macro-protein);
    box-shadow: 0 0 8px var(--macro-protein);
    animation: macro-pulse 1.6s ease-in-out infinite;
  }
  .macro-app .status.offline .dot { background: var(--macro-subtle); box-shadow: 0 0 8px var(--macro-subtle); }
  .macro-app .status .label { letter-spacing: 0.32em; }
  @keyframes macro-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  .macro-app .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1.2vh;
    padding: 1.2vh 0;
  }
  .macro-app .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .macro-app .day .lbl {
    font-size: 10px;
    letter-spacing: 0.32em;
    color: var(--macro-subtle);
  }
  .macro-app .day .circle {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: 1px solid #1c3552;
    color: var(--macro-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }
  .macro-app .day.active .lbl { color: var(--macro-accent); }
  .macro-app .day.active .circle {
    border-color: var(--macro-accent);
    color: var(--macro-accent);
    box-shadow: 0 0 22px rgba(56, 182, 255, 0.45),
                inset 0 0 12px rgba(56, 182, 255, 0.25);
  }

  .macro-app .panel {
    border: 1px solid var(--macro-border);
    background: var(--macro-card);
    padding: 2.4vh;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2vh;
    align-items: center;
  }
  .macro-app .panel .big {
    font-size: 120px;
    font-weight: 700;
    line-height: 1;
    color: var(--macro-accent);
    text-shadow: 0 0 22px rgba(56, 182, 255, 0.55);
  }
  .macro-app .panel .row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 10px;
  }
  .macro-app .panel .kcal-lbl {
    font-size: 13px;
    letter-spacing: 0.34em;
    color: var(--macro-muted);
  }
  .macro-app .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(56, 182, 255, 0.6);
    color: var(--macro-accent);
    padding: 4px 10px;
    font-size: 11px;
    letter-spacing: 0.32em;
  }
  .macro-app .panel .meta {
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--macro-subtle);
    margin-top: 8px;
  }

  .macro-app .macros {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2vh;
  }
  .macro-app .macro {
    border: 1px solid var(--macro-border);
    background: var(--macro-card);
    padding: 2vh;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1.6vh;
    align-items: center;
    min-height: 28vh;
  }
  .macro-app .macro.hl { border-color: rgba(255, 194, 74, 0.7); }
  .macro-app .macro .num {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .macro-app .macro .num .v {
    font-size: 56px;
    font-weight: 700;
    line-height: 1;
  }
  .macro-app .macro .num .u {
    font-size: 14px;
    letter-spacing: 0.2em;
    opacity: 0.85;
  }
  .macro-app .macro .lbl {
    font-size: 12px;
    letter-spacing: 0.4em;
    margin-top: 6px;
  }
  .macro-app .macro .sub {
    font-size: 10px;
    letter-spacing: 0.3em;
    color: var(--macro-subtle);
    margin-top: 2px;
  }
  .macro-app .macro.protein .num .v,
  .macro-app .macro.protein .num .u,
  .macro-app .macro.protein .lbl { color: var(--macro-protein); }
  .macro-app .macro.protein .num .v { text-shadow: 0 0 14px rgba(0,212,163,0.55); }
  .macro-app .macro.carbs .num .v,
  .macro-app .macro.carbs .num .u,
  .macro-app .macro.carbs .lbl { color: var(--macro-carbs); }
  .macro-app .macro.carbs .num .v { text-shadow: 0 0 14px rgba(255,194,74,0.55); }
  .macro-app .macro.fat .num .v,
  .macro-app .macro.fat .num .u,
  .macro-app .macro.fat .lbl { color: var(--macro-fat); }
  .macro-app .macro.fat .num .v { text-shadow: 0 0 14px rgba(62,197,227,0.55); }

  .macro-app .ring-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .macro-app .ring-wrap .icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .macro-app .ring-wrap svg circle { transition: stroke-dashoffset 600ms ease; }

  .macro-app .logged { font-family: inherit; display: flex; flex-direction: column; margin-top: 1vh; }
  .macro-app .logged header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1.4vh;
  }
  .macro-app .logged h2 {
    margin: 0;
    font-size: 15px;
    letter-spacing: 0.42em;
    font-weight: 700;
    color: var(--macro-accent);
  }
  .macro-app .logged .count {
    font-size: 10px;
    letter-spacing: 0.3em;
    color: var(--macro-subtle);
  }
  .macro-app .logged ul { list-style: none; padding: 0; margin: 0; }
  .macro-app .logged li {
    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
    gap: 2vh;
    padding: 1.4vh 0;
    border-top: 1px solid var(--macro-border);
  }
  .macro-app .logged li:first-child { border-top: 0; }
  .macro-app .logged .time {
    font-size: 13px;
    letter-spacing: 0.2em;
    color: var(--macro-subtle);
  }
  .macro-app .logged .name {
    font-size: 14px;
    letter-spacing: 0.18em;
    color: var(--macro-fg);
  }
  .macro-app .logged .meta {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 10px;
    letter-spacing: 0.22em;
    margin-top: 6px;
  }
  .macro-app .logged .kcal { display: inline-flex; align-items: center; gap: 4px; color: var(--macro-accent); }
  .macro-app .logged .p { color: var(--macro-protein); }
  .macro-app .logged .c { color: var(--macro-carbs); }
  .macro-app .logged .f { color: var(--macro-fat); }

  .macro-app .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    letter-spacing: 0.32em;
    color: var(--macro-subtle);
    margin-top: auto;
    padding-top: 1vh;
  }
  .macro-app .footer .live { color: var(--macro-protein); }
`
