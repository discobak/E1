"use client";
import { useEffect, useRef, useState } from "react";
import Lock from "./Lock";
import Home from "./Home";
import StatusBar from "./StatusBar";
import ControlPanel from "./ControlPanel";
import Icon from "./Icon";
import { WALLPAPERS } from "./hooks";
import { DEFAULT_SYS, Sys } from "./sys";
import { APPS, AppId } from "./apps";

type Stage = "off" | "boot" | "lock" | "home";
type Win = {
  id: AppId;
  phase: "enter" | "open" | "exit";
  x: number;
  y: number;
  w: number;
  h: number;
  sw: number;
  sh: number;
};

const CLOSE_MS = 400;

/** Estalo + chiado de curto-circuito, gerado na hora. */
function crashSound() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const dur = 2.2;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      const pop = i < 3000 ? 1 : 0;
      d[i] = (Math.random() * 2 - 1) * (pop * 0.9 + 0.25 * (1 - t) * (Math.random() < 0.6 ? 1 : 0.2));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 2500;
    const g = ctx.createGain();
    g.gain.value = 0.3;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.8);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
    og.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    src.connect(f).connect(g).connect(ctx.destination);
    o.connect(og).connect(ctx.destination);
    src.start();
    o.start();
    o.stop(ctx.currentTime + 0.9);
    setTimeout(() => ctx.close(), dur * 1000 + 200);
  } catch {}
}
const SPAN = 300; // distância (px) de arrasto para abrir o painel por completo
const EDGE = 36; // faixa no topo que puxa o painel mesmo dentro de um app

export default function Phone() {
  const [stage, setStage] = useState<Stage>("off");
  const [win, setWin] = useState<Win | null>(null);
  const [wall, setWall] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [sys, setSys] = useState<Sys>(DEFAULT_SYS);

  // tema (escuro por padrão) fica salvo no navegador
  useEffect(() => {
    try {
      const t = localStorage.getItem("celularweb:tema");
      if (t === "claro") setSys((s) => ({ ...s, dark: false }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("celularweb:tema", sys.dark ? "escuro" : "claro");
    } catch {}
  }, [sys.dark]);
  const [scale, setScale] = useState(1);
  const [smoke, setSmoke] = useState(false);
  const [crashing, setCrashing] = useState(false);

  // painel de controle: p = 0 (fechado) .. 1 (aberto)
  const [p, setP] = useState(0);
  const [drag, setDrag] = useState(false);
  const pRef = useRef(0);
  const g = useRef({ y: 0, active: false, captured: false, from: 0 });
  const suppress = useRef(false);

  const screenRef = useRef<HTMLDivElement>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPanel = (v: number) => {
    pRef.current = v;
    setP(v);
  };

  // escala o celular para caber na janela
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 24) / 800, (window.innerWidth - 24) / 400));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // o app de mensagens (May) manda o celular "pifar": fumaça + desliga
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onCrash = () => {
      if (closing.current) clearTimeout(closing.current);
      setCrashing(true);
      setSmoke(true);
      crashSound();
      timers.push(
        setTimeout(() => {
          setCrashing(false);
          setWin(null);
          setPanel(0);
          setStage("off");
        }, 700),
        setTimeout(() => setSmoke(false), 5500)
      );
    };
    window.addEventListener("celular:crash", onCrash);
    return () => {
      window.removeEventListener("celular:crash", onCrash);
      timers.forEach(clearTimeout);
    };
  }, []);

  // boot -> tela de bloqueio
  useEffect(() => {
    if (stage !== "boot") return;
    const t = setTimeout(() => setStage("lock"), 3200);
    return () => clearTimeout(t);
  }, [stage]);

  const openApp = (id: AppId, iconEl: HTMLElement, force = false) => {
    const screen = screenRef.current;
    if (!screen || (win && !force)) return;
    if (closing.current) clearTimeout(closing.current);
    const sr = screen.getBoundingClientRect();
    const ir = iconEl.getBoundingClientRect();
    const k = screen.offsetWidth / sr.width; // desfaz a escala do celular
    setWin({
      id,
      phase: "enter",
      x: (ir.left - sr.left) * k,
      y: (ir.top - sr.top) * k,
      w: ir.width * k,
      h: ir.height * k,
      sw: screen.offsetWidth,
      sh: screen.offsetHeight,
    });
    // dois frames: garante que o estado inicial (no ícone) foi pintado antes da transição
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setWin((w) => (w && w.phase === "enter" ? { ...w, phase: "open" } : w)))
    );
  };

  const closeApp = () => {
    if (!win || win.phase === "exit") return;
    setWin({ ...win, phase: "exit" });
    closing.current = setTimeout(() => setWin(null), CLOSE_MS);
  };

  const homeButton = () => {
    if (pRef.current > 0) setPanel(0);
    else closeApp();
  };

  const power = () => {
    if (closing.current) clearTimeout(closing.current);
    setPanel(0);
    if (stage === "off") setStage("boot");
    else if (stage === "lock") setStage("off");
    else if (stage === "home") {
      setWin(null);
      setStage("lock");
    }
  };

  // ===== gesto: arrastar para baixo abre o painel / para cima fecha =====
  const k = () => {
    const s = screenRef.current;
    return s ? s.offsetWidth / s.getBoundingClientRect().width : 1;
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = screenRef.current;
    if (!s || (win && win.phase !== "open")) return;
    const target = e.target as HTMLElement;
    if (target.closest("input")) return; // não atrapalha os sliders
    const yRel = (e.clientY - s.getBoundingClientRect().top) * k();
    const open = pRef.current > 0;
    const allowed = open || !win || yRel < EDGE;
    if (!allowed) return;
    g.current = { y: e.clientY, active: true, captured: false, from: open ? 1 : 0 };
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = g.current;
    if (!st.active) return;
    const dy = (e.clientY - st.y) * k();
    if (!st.captured) {
      if (Math.abs(dy) < 10) return;
      const okDir = st.from === 0 ? dy > 0 : dy < 0;
      if (!okDir) {
        st.active = false;
        return;
      }
      st.captured = true;
      setDrag(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setPanel(Math.max(0, Math.min(1, st.from + dy / SPAN)));
  };

  const onUp = () => {
    const st = g.current;
    if (!st.active) return;
    st.active = false;
    if (!st.captured) return;
    st.captured = false;
    suppress.current = true;
    setTimeout(() => (suppress.current = false), 60);
    setDrag(false);
    const v = pRef.current;
    setPanel(st.from === 0 ? (v > 0.25 ? 1 : 0) : v < 0.75 ? 0 : 1);
  };

  const Current = win ? APPS[win.id].component : null;

  let winStyle: React.CSSProperties = {};
  if (win) {
    const winBg = sys.dark && !APPS[win.id].dark ? "#0b0b0d" : APPS[win.id].bg;
    const sx = win.w / win.sw;
    const sy = win.h / win.sh;
    winStyle =
      win.phase === "open"
        ? { transform: "translate(0px,0px) scale(1,1)", borderRadius: "44px / 44px", background: winBg }
        : {
            transform: `translate(${win.x}px,${win.y}px) scale(${sx},${sy})`,
            borderRadius: `${15 / sx}px / ${15 / sy}px`,
            background: winBg,
          };
  }

  const statusLight = !win || win.phase === "exit" ? true : sys.dark || APPS[win.id].dark;

  return (
    <div className="phone-wrap" style={{ transform: `scale(${scale})` }}>
      <div className={"phone" + (crashing ? " crashing" : "") + (sys.dark ? " darkmode" : "")}>
        <button className="btn-side btn-vol1" aria-label="Volume +" onClick={() => setSys((s) => ({ ...s, volume: Math.min(100, s.volume + 10) }))} />
        <button className="btn-side btn-vol2" aria-label="Volume -" onClick={() => setSys((s) => ({ ...s, volume: Math.max(0, s.volume - 10) }))} />
        <button className="btn-side btn-power" aria-label="Ligar / desligar" onClick={power} />

        <div className="screen" ref={screenRef}>
          <div className="camera" />

          {stage === "off" && (
            <div className="off">
              <span>Clique no botão lateral direito para ligar</span>
            </div>
          )}

          {stage === "boot" && (
            <div className="boot">
              <div className="boot-logo">
                <Icon name="phone" size={64} stroke={1.4} />
              </div>
              <div className="boot-name">CelularWeb</div>
              <div className="boot-bar">
                <i />
              </div>
              <div className="boot-text">Iniciando...</div>
            </div>
          )}

          {stage === "home" && (
            <div
              className="os"
              style={{ background: WALLPAPERS[wall] }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClickCapture={(e) => {
                if (suppress.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <Home onOpen={openApp} behind={(!!win && win.phase !== "exit") || p > 0} />

              {win && Current && (
                <div className={"win " + win.phase} style={winStyle}>
                  <div className="win-content">
                    <Current
                      sys={sys}
                      setSys={setSys}
                      wall={wall}
                      setWall={setWall}
                      brightness={brightness}
                      setBrightness={setBrightness}
                    />
                  </div>
                </div>
              )}

              <StatusBar light={statusLight} sys={sys} />
              <div className="edge" />

              <ControlPanel
                p={p}
                drag={drag}
                sys={sys}
                setSys={setSys}
                brightness={brightness}
                setBrightness={setBrightness}
                onClose={() => setPanel(0)}
                onSettings={(el) => {
                  setPanel(0);
                  if (win?.id === "config") return;
                  openApp("config", el, true);
                }}
              />

              <button className="home-bar" aria-label="Voltar ao início" onClick={homeButton}>
                <i className={statusLight || !win ? "" : "darkbar"} />
              </button>
            </div>
          )}

          {stage === "lock" && <Lock wall={wall} onUnlock={() => setStage("home")} />}

          {stage !== "off" && stage !== "boot" && (
            <div className="dim" style={{ opacity: ((100 - brightness) / 100) * 0.75 }} />
          )}
        </div>

        {smoke && (
          <div className="smoke" aria-hidden>
            {Array.from({ length: 14 }).map((_, i) => (
              <i
                key={i}
                style={{
                  left: `${8 + ((i * 37) % 80)}%`,
                  animationDelay: `${(i % 7) * 0.35}s`,
                  animationDuration: `${2.6 + (i % 4) * 0.5}s`,
                  width: `${70 + (i % 5) * 20}px`,
                  height: `${70 + (i % 5) * 20}px`,
                  ["--dx" as string]: `${((i % 5) - 2) * 28}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
