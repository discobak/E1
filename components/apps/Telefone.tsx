"use client";
import { useEffect, useState } from "react";
import { pad } from "../hooks";

const fmtNum = (n: string) => {
  const d = n.replace(/\D/g, "");
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
};

export default function Telefone() {
  const [num, setNum] = useState("");
  const [calling, setCalling] = useState(false);
  const [sec, setSec] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [tab, setTab] = useState<"teclado" | "recentes">("teclado");

  useEffect(() => {
    if (!calling) return;
    setSec(0);
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [calling]);

  const hang = () => {
    setCalling(false);
    setRecent((r) => [num, ...r].slice(0, 20));
    setNum("");
  };

  if (calling) {
    return (
      <div className="app dark call">
        <div className="call-avatar">👤</div>
        <div className="call-name">{fmtNum(num)}</div>
        <div className="muted">{sec < 3 ? "Chamando..." : `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`}</div>
        <button className="hang" onClick={hang}>📵</button>
      </div>
    );
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  return (
    <div className="app light">
      <div className="tabs">
        <button className={tab === "teclado" ? "on" : ""} onClick={() => setTab("teclado")}>Teclado</button>
        <button className={tab === "recentes" ? "on" : ""} onClick={() => setTab("recentes")}>Recentes</button>
      </div>
      {tab === "teclado" ? (
        <div className="dialer">
          <div className="dial-display">{fmtNum(num) || " "}</div>
          <div className="dial-keys">
            {keys.map((k) => (
              <button key={k} onClick={() => setNum((n) => (n + k).slice(0, 11))}>{k}</button>
            ))}
          </div>
          <div className="row">
            <button className="pill green big" disabled={num.length < 3} onClick={() => setCalling(true)}>📞 Ligar</button>
            <button className="pill" onClick={() => setNum(num.slice(0, -1))}>⌫</button>
          </div>
        </div>
      ) : (
        <div className="list">
          {recent.length === 0 && <div className="muted pad">Sem chamadas recentes.</div>}
          {recent.map((r, i) => (
            <button key={i} className="list-item" onClick={() => { setNum(r); setTab("teclado"); }}>
              <b>{fmtNum(r)}</b>
              <small>Chamada realizada</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
