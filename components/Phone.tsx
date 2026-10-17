"use client";
import { useEffect, useRef, useState } from "react";
import Lock from "./Lock";
import Home from "./Home";
import StatusBar from "./StatusBar";
import Icon from "./Icon";
import { WALLPAPERS } from "./hooks";
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

const OPEN_MS = 460;
const CLOSE_MS = 400;

export default function Phone() {
  const [stage, setStage] = useState<Stage>("off");
  const [win, setWin] = useState<Win | null>(null);
  const [wall, setWall] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [scale, setScale] = useState(1);
  const screenRef = useRef<HTMLDivElement>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);

  // escala o celular para caber na janela
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 24) / 800, (window.innerWidth - 24) / 400));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // boot -> tela de bloqueio
  useEffect(() => {
    if (stage !== "boot") return;
    const t = setTimeout(() => setStage("lock"), 3200);
    return () => clearTimeout(t);
  }, [stage]);

  const openApp = (id: AppId, iconEl: HTMLElement) => {
    const screen = screenRef.current;
    if (!screen || win) return;
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

  const power = () => {
    if (closing.current) clearTimeout(closing.current);
    if (stage === "off") setStage("boot");
    else if (stage === "lock") setStage("off");
    else if (stage === "home") {
      setWin(null);
      setStage("lock");
    }
  };

  const Current = win ? APPS[win.id].component : null;

  let winStyle: React.CSSProperties = {};
  if (win) {
    const sx = win.w / win.sw;
    const sy = win.h / win.sh;
    winStyle =
      win.phase === "open"
        ? { transform: "translate(0px,0px) scale(1,1)", borderRadius: "44px / 44px", background: APPS[win.id].bg }
        : {
            transform: `translate(${win.x}px,${win.y}px) scale(${sx},${sy})`,
            borderRadius: `${15 / sx}px / ${15 / sy}px`,
            background: APPS[win.id].bg,
          };
  }

  const statusLight = !win || win.phase === "exit" ? true : APPS[win.id].dark;

  return (
    <div className="phone-wrap" style={{ transform: `scale(${scale})` }}>
      <div className="phone">
        <button className="btn-side btn-vol1" aria-label="Volume +" />
        <button className="btn-side btn-vol2" aria-label="Volume -" />
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
            <div className="os" style={{ background: WALLPAPERS[wall] }}>
              <Home onOpen={openApp} behind={!!win && win.phase !== "exit"} />

              {win && Current && (
                <div className={"win " + win.phase} style={winStyle}>
                  <div className="win-content">
                    <Current
                      wall={wall}
                      setWall={setWall}
                      brightness={brightness}
                      setBrightness={setBrightness}
                    />
                  </div>
                </div>
              )}

              <StatusBar light={statusLight} />
              <button className="home-bar" aria-label="Voltar ao início" onClick={closeApp}>
                <i className={statusLight || !win ? "" : "darkbar"} />
              </button>
            </div>
          )}

          {stage === "lock" && <Lock wall={wall} onUnlock={() => setStage("home")} />}

          {stage !== "off" && stage !== "boot" && (
            <div className="dim" style={{ opacity: ((100 - brightness) / 100) * 0.75 }} />
          )}
        </div>
      </div>
    </div>
  );
}
