"use client";
import { APPS, AppId } from "./apps";
import Icon from "./Icon";
import { useNow, pad } from "./hooks";

const DOCK: AppId[] = ["telefone", "mensagens", "navegador", "camera"];
const DAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

type OpenFn = (id: AppId, iconEl: HTMLElement) => void;

// fora do Home para não ser recriado a cada segundo (o relógio atualiza o Home)
function AppIcon({ id, onOpen, label = true }: { id: AppId; onOpen: OpenFn; label?: boolean }) {
  return (
    <button
      className="icon"
      onClick={(e) => onOpen(id, e.currentTarget.querySelector(".icon-img") as HTMLElement)}
    >
      <span className="icon-img" style={{ background: APPS[id].grad }}>
        <Icon name={APPS[id].icon} size={28} stroke={1.8} />
      </span>
      {label && <span className="icon-name">{APPS[id].name}</span>}
    </button>
  );
}

export default function Home({ onOpen, behind }: { onOpen: OpenFn; behind: boolean }) {
  const now = useNow(1000);
  const ids = Object.keys(APPS) as AppId[];
  const grid = ids.filter((id) => !DOCK.includes(id));

  return (
    <div className={"home" + (behind ? " behind" : "")}>
      <div className="widget">
        <div className="widget-time">{now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : " "}</div>
        <div className="widget-date">
          {now ? `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}` : " "}
        </div>
      </div>
      <div className="grid">
        {grid.map((id) => (
          <AppIcon key={id} id={id} onOpen={onOpen} />
        ))}
      </div>
      <div className="dock">
        {DOCK.map((id) => (
          <AppIcon key={id} id={id} onOpen={onOpen} label={false} />
        ))}
      </div>
    </div>
  );
}
