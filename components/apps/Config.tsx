"use client";
import { useState } from "react";
import { WALLPAPERS } from "../hooks";
import type { AppProps } from "./index";

export default function Config({ wall, setWall, brightness, setBrightness }: AppProps) {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  const [plane, setPlane] = useState(false);

  const Toggle = ({ label, v, set }: { label: string; v: boolean; set: (b: boolean) => void }) => (
    <div className="setting">
      <span>{label}</span>
      <button className={"switch" + (v ? " on" : "")} onClick={() => set(!v)}><i /></button>
    </div>
  );

  return (
    <div className="app light">
      <div className="appbar"><h2>Ajustes</h2></div>
      <div className="settings">
        <Toggle label="Modo avião" v={plane} set={setPlane} />
        <Toggle label="Wi-Fi" v={wifi && !plane} set={setWifi} />
        <Toggle label="Bluetooth" v={bt && !plane} set={setBt} />

        <div className="setting col">
          <span>Brilho</span>
          <input type="range" min={20} max={100} value={brightness} onChange={(e) => setBrightness(+e.target.value)} />
        </div>

        <div className="setting col">
          <span>Papel de parede</span>
          <div className="walls">
            {WALLPAPERS.map((w, i) => (
              <button key={i} className={i === wall ? "on" : ""} style={{ background: w }} onClick={() => setWall(i)} />
            ))}
          </div>
        </div>

        <div className="setting col">
          <span>Sobre</span>
          <small className="muted">CelularWeb 1.0 · Senha: 1234</small>
        </div>
      </div>
    </div>
  );
}
