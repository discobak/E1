"use client";
import Icon, { IconName } from "../Icon";
import { WALLPAPERS } from "../hooks";
import { BoolKey, Sys, toggleSys } from "../sys";
import type { AppProps } from "./index";

function Toggle({
  icon, color, label, k, sys, setSys,
}: { icon: IconName; color: string; label: string; k: BoolKey; sys: Sys; setSys: (s: Sys) => void }) {
  const v = sys[k];
  return (
    <div className="setting">
      <span className="setting-l">
        <span className="setting-ic" style={{ background: color }}><Icon name={icon} size={18} /></span>
        {label}
      </span>
      <button className={"switch" + (v ? " on" : "")} onClick={() => setSys(toggleSys(sys, k))} aria-label={label}><i /></button>
    </div>
  );
}

export default function Config({ sys, setSys, wall, setWall, brightness, setBrightness }: AppProps) {
  return (
    <div className="app light">
      <div className="appbar"><h2>Ajustes</h2></div>
      <div className="settings">
        <Toggle icon="moon" color="#4f46e5" label="Modo escuro" k="dark" sys={sys} setSys={setSys} />
        <Toggle icon="plane" color="#f59e0b" label="Modo avião" k="plane" sys={sys} setSys={setSys} />
        <Toggle icon="wifi" color="#2563eb" label="Wi-Fi" k="wifi" sys={sys} setSys={setSys} />
        <Toggle icon="bluetooth" color="#0ea5e9" label="Bluetooth" k="bt" sys={sys} setSys={setSys} />
        <Toggle icon="moon" color="#6366f1" label="Não perturbe" k="dnd" sys={sys} setSys={setSys} />
        <Toggle icon="zap" color="#ca8a04" label="Economia de bateria" k="saver" sys={sys} setSys={setSys} />

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
          <small className="muted">CelularWeb 2.1 · Senha de bloqueio: 1234</small>
        </div>
      </div>
    </div>
  );
}
