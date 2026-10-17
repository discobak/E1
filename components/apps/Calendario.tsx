"use client";
import { useState } from "react";
import Icon from "../Icon";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function Calendario() {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [sel, setSel] = useState<number | null>(today.getDate());

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const nav = (d: number) => {
    const nd = new Date(y, m + d, 1);
    setY(nd.getFullYear());
    setM(nd.getMonth());
    setSel(null);
  };
  const isToday = (d: number) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

  const selDate = sel ? new Date(y, m, sel) : null;
  const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

  return (
    <div className="app light">
      <div className="appbar">
        <button onClick={() => nav(-1)} aria-label="Mês anterior"><Icon name="back" size={24} /></button>
        <h2 key={`${y}-${m}`} className="fadein">{MONTHS[m]} {y}</h2>
        <button onClick={() => nav(1)} aria-label="Próximo mês"><Icon name="forward" size={24} /></button>
      </div>
      <div className="cal" key={`${y}-${m}`}>
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="cal-h">{d}</div>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              onClick={() => setSel(d)}
              className={"cal-d" + (isToday(d) ? " today" : "") + (sel === d ? " sel" : "")}
            >
              {d}
            </button>
          ) : (
            <div key={i} />
          )
        )}
      </div>
      <div className="cal-info">
        {selDate ? `${WEEKDAYS[selDate.getDay()]}, ${selDate.getDate()} de ${MONTHS[m].toLowerCase()}` : "Selecione um dia"}
        {sel && isToday(sel) && <span className="tag">Hoje</span>}
      </div>
      <button
        className="pill todaybtn"
        onClick={() => {
          setY(today.getFullYear());
          setM(today.getMonth());
          setSel(today.getDate());
        }}
      >
        Ir para hoje
      </button>
    </div>
  );
}
