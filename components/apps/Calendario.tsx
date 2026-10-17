"use client";
import { useState } from "react";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function Calendario() {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const nav = (d: number) => {
    const nd = new Date(y, m + d, 1);
    setY(nd.getFullYear());
    setM(nd.getMonth());
  };

  return (
    <div className="app light">
      <div className="appbar">
        <button onClick={() => nav(-1)}>‹</button>
        <h2>{MONTHS[m]} {y}</h2>
        <button onClick={() => nav(1)}>›</button>
      </div>
      <div className="cal">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="cal-h">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={"cal-d" + (d && d === today.getDate() && m === today.getMonth() && y === today.getFullYear() ? " today" : "")}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
