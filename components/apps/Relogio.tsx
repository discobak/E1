"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { useNow, pad } from "../hooks";

type Tab = "hora" | "cron" | "timer";

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.35);
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.35 + 0.2);
      o.start(ctx.currentTime + i * 0.35);
      o.stop(ctx.currentTime + i * 0.35 + 0.25);
    }
  } catch {}
}

export default function Relogio() {
  const [tab, setTab] = useState<Tab>("hora");
  const now = useNow(1000);

  // cronômetro
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const base = useRef(0);
  useEffect(() => {
    if (!running) return;
    base.current = Date.now() - ms;
    const t = setInterval(() => setMs(Date.now() - base.current), 33);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  const f = (v: number) => `${pad(Math.floor(v / 60000))}:${pad(Math.floor(v / 1000) % 60)},${pad(Math.floor(v / 10) % 100)}`;

  // timer
  const [setMin, setSetMin] = useState(1);
  const [left, setLeft] = useState(60);
  const [tOn, setTOn] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!tOn) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setTOn(false);
          setDone(true);
          beep();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [tOn]);

  const h = now?.getHours() ?? 0;
  const m = now?.getMinutes() ?? 0;
  const s = now?.getSeconds() ?? 0;
  const total = setMin * 60;
  const frac = total ? left / total : 0;
  const R = 90;
  const C = 2 * Math.PI * R;

  const TABS: [Tab, string][] = [["hora", "Hora"], ["cron", "Cronômetro"], ["timer", "Timer"]];

  return (
    <div className="app light">
      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "hora" && (
        <div className="center-col" key="hora">
          <svg viewBox="-100 -100 200 200" width="230" height="230">
            <circle r="96" fill="#fff" stroke="#111" strokeWidth="3" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="0" y1="-86" x2="0" y2="-76" stroke="#111" strokeWidth="3" transform={`rotate(${i * 30})`} />
            ))}
            <line x1="0" y1="0" x2="0" y2="-45" stroke="#111" strokeWidth="5" strokeLinecap="round" transform={`rotate(${(h % 12) * 30 + m / 2})`} />
            <line x1="0" y1="0" x2="0" y2="-68" stroke="#111" strokeWidth="3" strokeLinecap="round" transform={`rotate(${m * 6})`} />
            <line x1="0" y1="10" x2="0" y2="-76" stroke="#dc2626" strokeWidth="1.5" transform={`rotate(${s * 6})`} />
            <circle r="4" fill="#dc2626" />
          </svg>
          <div className="big-time">{now ? `${pad(h)}:${pad(m)}:${pad(s)}` : ""}</div>
          <div className="muted">Horário local</div>
        </div>
      )}

      {tab === "cron" && (
        <div className="center-col" key="cron">
          <div className="big-time mono">{f(ms)}</div>
          <div className="row">
            <button
              className="pill"
              onClick={() => {
                if (running) setLaps([ms, ...laps]);
                else {
                  setMs(0);
                  setLaps([]);
                }
              }}
            >
              {running ? "Volta" : "Zerar"}
            </button>
            <button className={"pill " + (running ? "red" : "green")} onClick={() => setRunning(!running)}>
              <Icon name={running ? "pause" : "play"} size={16} fill="currentColor" /> {running ? "Parar" : "Iniciar"}
            </button>
          </div>
          <div className="laps">
            {laps.map((l, i) => (
              <div key={i}>
                <span>Volta {laps.length - i}</span>
                <span className="mono">{f(l)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "timer" && (
        <div className="center-col" key="timer">
          <div className="ring">
            <svg viewBox="-100 -100 200 200" width="230" height="230">
              <circle r={R} fill="none" stroke="#e2e4e9" strokeWidth="8" />
              <circle
                r={R}
                fill="none"
                stroke={done ? "#dc2626" : "#2563eb"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                transform="rotate(-90)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="ring-text">
              <b className="mono">{pad(Math.floor(left / 60))}:{pad(left % 60)}</b>
              {done && <small>Tempo esgotado</small>}
            </div>
          </div>
          {!tOn && (
            <div className="row">
              <button className="roundbtn" aria-label="Menos um minuto" onClick={() => { const v = Math.max(1, setMin - 1); setSetMin(v); setLeft(v * 60); setDone(false); }}>
                <Icon name="minus" size={20} />
              </button>
              <span className="muted">{setMin} min</span>
              <button className="roundbtn" aria-label="Mais um minuto" onClick={() => { const v = Math.min(60, setMin + 1); setSetMin(v); setLeft(v * 60); setDone(false); }}>
                <Icon name="plus" size={20} />
              </button>
            </div>
          )}
          <div className="row">
            <button className="pill" onClick={() => { setTOn(false); setLeft(setMin * 60); setDone(false); }}>Cancelar</button>
            <button
              className={"pill " + (tOn ? "red" : "green")}
              onClick={() => {
                if (left === 0) setLeft(setMin * 60);
                setDone(false);
                setTOn(!tOn);
              }}
            >
              {tOn ? "Pausar" : "Iniciar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
