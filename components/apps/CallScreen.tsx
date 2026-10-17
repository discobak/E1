"use client";
import { useEffect, useState } from "react";
import Icon, { IconName } from "../Icon";
import { fmtNum, pad } from "../data";

const CONNECT_AFTER = 3; // segundos até "atender"

const BUTTONS: { key: string; label: string; icon: IconName }[] = [
  { key: "mute", label: "Mudo", icon: "micoff" },
  { key: "keys", label: "Teclado", icon: "keypad" },
  { key: "spk", label: "Viva-voz", icon: "volume" },
  { key: "add", label: "Adicionar", icon: "userplus" },
  { key: "vid", label: "Vídeo", icon: "video" },
  { key: "ctt", label: "Contatos", icon: "user" },
];

export default function CallScreen({
  name,
  phone,
  onEnd,
}: {
  name: string;
  phone: string;
  onEnd: (dur: number, answered: boolean) => void;
}) {
  const [sec, setSec] = useState(0);
  const [on, setOn] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const connected = sec >= CONNECT_AFTER;
  const dur = Math.max(0, sec - CONNECT_AFTER);

  return (
    <div className="call-screen">
      <div className="call-top">
        <div className={"call-avatar" + (connected ? "" : " ringing")}>
          {name ? name.charAt(0).toUpperCase() : <Icon name="user" size={44} stroke={1.6} />}
        </div>
        <div className="call-name">{name || fmtNum(phone)}</div>
        {name && <div className="call-num">{fmtNum(phone)}</div>}
        <div className="call-status">{connected ? `${pad(Math.floor(dur / 60))}:${pad(dur % 60)}` : "Chamando..."}</div>
      </div>

      <div className="call-grid">
        {BUTTONS.map((b) => (
          <button key={b.key} className={on[b.key] ? "on" : ""} onClick={() => setOn({ ...on, [b.key]: !on[b.key] })}>
            <span>
              <Icon name={b.icon} size={24} />
            </span>
            {b.label}
          </button>
        ))}
      </div>

      <button className="hang" aria-label="Encerrar chamada" onClick={() => onEnd(dur, connected)}>
        <Icon name="phone" size={30} />
      </button>
    </div>
  );
}
