"use client";
import { useState } from "react";
import Icon, { IconName } from "../Icon";
import { WALLPAPERS } from "../hooks";
import type { AppProps } from "./index";

function Toggle({ icon, color, label, v, set }: { icon: IconName; color: string; label: string; v: boolean; set: (b: boolean) => void }) {
  return (
    <div className="setting">
      <span className="setting-l">
        <span className="setting-ic" style={{ background: color }}><Icon name={icon} size={18} /></span>
        {label}
      </span>
      <button className={"switch" + (v ? " on" : "")} onClick={() => set(!v)} aria-label={label}><i /></button>
    </div>
  );
}

export default function Config({ wall, setWall, brightness, setBrightness }: AppProps) {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  const [plane, setPlane] = useState(false);

  return (
    <div className="app light">
      <div className="appbar"><h2>Ajustes</h2></div>
      <div className="settings">
        <Toggle icon="plane" color="#f59e0b" label="Modo avião" v={plane} set={setPlane} />
        <Toggle icon="wifi" color="#2563eb" label="Wi-Fi" v={wifi && !plane} set={setWifi} />
        <Toggle icon="bluetooth" color="#0ea5e9" label="Bluetooth" v={bt && !plane} set={setBt} />

        <div className="setting col">
          <span className="setting-l">
            <span className="setting-ic" style={{ background: "#eab308" }}><Icon name="sun" size={18} /></span>
            Brilho
          </span>
          <input type="range" min={20} max={100} value={brightness} onChange={(e) => setBrightness(+e.target.value)} />
        </div>

        <div className="setting col">
          <span className="setting-l">
            <span className="setting-ic" style={{ background: "#a855f7" }}><Icon name="image" size={18} /></span>
            Papel de parede
          </span>
          <div className="walls">
            {WALLPAPERS.map((w, i) => (
              <button key={i} className={i === wall ? "on" : ""} style={{ background: w }} onClick={() => setWall(i)} aria-label={`Papel de parede ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="setting col">
          <span className="setting-l">Sobre</span>
          <small className="muted">CelularWeb 2.0 · Senha de bloqueio: 1234</small>
        </div>
      </div>
    </div>
  );
}
