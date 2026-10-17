"use client";
import { useEffect, useRef, useState } from "react";
import { useNow, pad } from "../hooks";

export default function Relogio() {
  const [tab, setTab] = useState<"hora" | "cronometro">("hora");
  const now = useNow(1000);
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    base.current = start;
    const t = setInterval(() => setMs(Date.now() - base.current), 33);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const f = (v: number) => `${pad(Math.floor(v / 60000))}:${pad(Math.floor(v / 1000) % 60)},${pad(Math.floor(v / 10) % 100)}`;

  const h = now?.getHours() ?? 0, m = now?.getMinutes() ?? 0, s = now?.getSeconds() ?? 0;

  return (
    <div className="app light">
      <div className="tabs">
        <button className={tab === "hora" ? "on" : ""} onClick={() => setTab("hora")}>Hora</button>
        <button className={tab === "cronometro" ? "on" : ""} onClick={() => setTab("cronometro")}>Cronômetro</button>
      </div>

      {tab === "hora" ? (
        <div className="center-col">
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
          <div className="muted">São Paulo, Brasil</div>
        </div>
      ) : (
        <div className="center-col">
          <div className="big-time mono">{f(ms)}</div>
          <div className="row">
            <button className="pill" onClick={() => { if (running) setLaps([ms, ...laps]); else { setMs(0); setLaps([]); } }}>
              {running ? "Volta" : "Zerar"}
            </button>
            <button className={"pill " + (running ? "red" : "green")} onClick={() => setRunning(!running)}>
              {running ? "Parar" : "Iniciar"}
            </button>
          </div>
          <div className="laps">
            {laps.map((l, i) => (
              <div key={i}><span>Volta {laps.length - i}</span><span className="mono">{f(l)}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
