"use client";
import { useEffect, useState } from "react";
import Lock from "./Lock";
import Home from "./Home";
import StatusBar from "./StatusBar";
import { WALLPAPERS } from "./hooks";
import { APPS, AppId } from "./apps";

type Stage = "off" | "boot" | "lock" | "home";

export default function Phone() {
  const [stage, setStage] = useState<Stage>("off");
  const [app, setApp] = useState<AppId | null>(null);
  const [wall, setWall] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [scale, setScale] = useState(1);

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

  const power = () => {
    if (stage === "off") setStage("boot");
    else if (stage === "lock") setStage("off");
    else if (stage === "home") {
      setApp(null);
      setStage("lock");
    }
  };

  const Current = app ? APPS[app].component : null;

  return (
    <div className="phone-wrap" style={{ transform: `scale(${scale})` }}>
      <div className="phone">
        <button className="btn-side btn-vol1" aria-label="Volume +" />
        <button className="btn-side btn-vol2" aria-label="Volume -" />
        <button className="btn-side btn-power" aria-label="Ligar / desligar" onClick={power} />

        <div className="screen" style={{ background: stage === "off" ? "#000" : undefined }}>
          <div className="camera" />

          {stage === "off" && (
            <div className="off" onDoubleClick={() => setStage("boot")}>
              <span>Clique no botão lateral para ligar</span>
            </div>
          )}

          {stage === "boot" && (
            <div className="boot">
              <div className="boot-logo">◐</div>
              <div className="boot-name">CelularWeb</div>
              <div className="boot-bar">
                <i />
              </div>
              <div className="boot-text">Iniciando...</div>
            </div>
          )}

          {stage === "home" && (
            <div className="os" style={{ background: WALLPAPERS[wall] }}>
              <StatusBar />
              {Current ? (
                <div className="app-window" key={app}>
                  <Current
                    wall={wall}
                    setWall={setWall}
                    brightness={brightness}
                    setBrightness={setBrightness}
                  />
                </div>
              ) : (
                <Home onOpen={setApp} />
              )}
              <button className="home-bar" aria-label="Início" onClick={() => setApp(null)} />
            </div>
          )}

          {stage === "lock" && <Lock wall={wall} onUnlock={() => setStage("home")} />}

          {stage !== "off" && stage !== "boot" && (
            <div className="dim" style={{ opacity: (100 - brightness) / 100 * 0.75 }} />
          )}
        </div>
      </div>
    </div>
  );
}
