"use client";
import { APPS, AppId } from "./apps";

const DOCK: AppId[] = ["telefone", "mensagens", "relogio", "calculadora"];

export default function Home({ onOpen }: { onOpen: (id: AppId) => void }) {
  const ids = Object.keys(APPS) as AppId[];
  const grid = ids.filter((id) => !DOCK.includes(id));
  const Icon = ({ id }: { id: AppId }) => (
    <button className="icon" onClick={() => onOpen(id)}>
      <span className="icon-img" style={{ background: APPS[id].color }}>
        {APPS[id].emoji}
      </span>
      <span className="icon-name">{APPS[id].name}</span>
    </button>
  );
  return (
    <div className="home">
      <div className="grid">
        {grid.map((id) => (
          <Icon key={id} id={id} />
        ))}
      </div>
      <div className="dock">
        {DOCK.map((id) => (
          <Icon key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
