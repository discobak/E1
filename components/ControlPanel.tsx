"use client";
import Icon, { IconName } from "./Icon";
import { BoolKey, Sys, toggleSys } from "./sys";
import { useNow, pad } from "./hooks";

const TILES: { key: BoolKey; label: string; icon: IconName }[] = [
  { key: "wifi", label: "Wi-Fi", icon: "wifi" },
  { key: "bt", label: "Bluetooth", icon: "bluetooth" },
  { key: "plane", label: "Avião", icon: "plane" },
  { key: "flash", label: "Lanterna", icon: "flashlight" },
  { key: "dnd", label: "Não perturbe", icon: "moon" },
  { key: "saver", label: "Economia", icon: "zap" },
  { key: "rotate", label: "Girar tela", icon: "flip" },
];

const DAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function ControlPanel({
  p,
  drag,
  sys,
  setSys,
  brightness,
  setBrightness,
  onSettings,
  onClose,
}: {
  p: number; // 0 = fechado, 1 = aberto
  drag: boolean;
  sys: Sys;
  setSys: (s: Sys) => void;
  brightness: number;
  setBrightness: (n: number) => void;
  onSettings: (el: HTMLElement) => void;
  onClose: () => void;
}) {
  const now = useNow(1000);
  const ease = drag ? "none" : "transform .5s cubic-bezier(.22,.9,.28,1), opacity .4s";
  const visible = p > 0;

  return (
    <>
      <div
        className="cp-backdrop"
        style={{
          opacity: p,
          pointerEvents: visible ? "auto" : "none",
          transition: drag ? "none" : "opacity .4s",
        }}
        onClick={onClose}
      />
      <div
        className="cp"
        style={{
          transform: `translateY(${(p - 1) * 100}%)`,
          transition: ease,
          pointerEvents: visible ? "auto" : "none",
          visibility: visible || drag ? "visible" : "hidden",
        }}
      >
        <div className="cp-head">
          <div>
            <b>{now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : ""}</b>
            <small>{now ? `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}` : ""}</small>
          </div>
          <button className="cp-gear" aria-label="Abrir Ajustes" onClick={(e) => onSettings(e.currentTarget)}>
            <Icon name="sliders" size={20} />
          </button>
        </div>

        <div className="cp-tiles">
          {TILES.map((t, i) => (
            <button
              key={t.key}
              className={"cp-tile" + (sys[t.key] ? " on" : "")}
              style={{
                transform: `scale(${0.82 + 0.18 * p})`,
                opacity: Math.min(1, p * 1.4),
                transition: drag ? "none" : `transform .45s cubic-bezier(.3,1.3,.5,1) ${i * 25}ms, opacity .3s ${i * 25}ms, background .2s`,
              }}
              onClick={() => setSys(toggleSys(sys, t.key))}
            >
              <span className="cp-ic">
                <Icon name={t.icon} size={22} />
              </span>
              <small>{t.label}</small>
            </button>
          ))}
        </div>

        <div className="cp-slider">
          <Icon name="sun" size={18} />
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            aria-label="Brilho"
            onChange={(e) => setBrightness(+e.target.value)}
            style={{ "--v": `${((brightness - 20) / 80) * 100}%` } as React.CSSProperties}
          />
        </div>
        <div className="cp-slider">
          <Icon name="volume" size={18} />
          <input
            type="range"
            min={0}
            max={100}
            value={sys.volume}
            aria-label="Volume"
            onChange={(e) => setSys({ ...sys, volume: +e.target.value })}
            style={{ "--v": `${sys.volume}%` } as React.CSSProperties}
          />
        </div>

        <div className="cp-grab" />
      </div>
    </>
  );
}
