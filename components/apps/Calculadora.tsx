"use client";
import { useState } from "react";
import Icon from "../Icon";

type Key = { label: string; fn: () => void; kind?: string; icon?: boolean };

export default function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const calc = (a: number, b: number, o: string) =>
    o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : o === "÷" ? (b === 0 ? NaN : a / b) : b;

  const fmt = (n: number) => (Number.isNaN(n) ? "Erro" : String(parseFloat(n.toPrecision(10))));
  const show = (n: number) => fmt(n).replace(".", ",");
  const cur = () => parseFloat(display.replace(",", "."));

  const digit = (d: string) => {
    if (fresh) {
      setDisplay(d === "," ? "0," : d);
      setFresh(false);
    } else {
      if (d === "," && display.includes(",")) return;
      if (display.replace(/\D/g, "").length >= 12) return;
      setDisplay(display === "0" && d !== "," ? d : display + d);
    }
  };

  const operator = (o: string) => {
    const c = cur();
    if (prev !== null && op && !fresh) {
      const r = calc(prev, c, op);
      setPrev(r);
      setDisplay(show(r));
    } else setPrev(c);
    setOp(o);
    setFresh(true);
  };

  const equals = () => {
    if (prev === null || !op) return;
    setDisplay(show(calc(prev, cur(), op)));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const keys: Key[] = [
    { label: "C", fn: clear, kind: "fn" },
    { label: "±", fn: () => setDisplay(show(-cur())), kind: "fn" },
    { label: "%", fn: () => setDisplay(show(cur() / 100)), kind: "fn" },
    { label: "÷", fn: () => operator("÷"), kind: "op" },
    { label: "7", fn: () => digit("7") },
    { label: "8", fn: () => digit("8") },
    { label: "9", fn: () => digit("9") },
    { label: "×", fn: () => operator("×"), kind: "op" },
    { label: "4", fn: () => digit("4") },
    { label: "5", fn: () => digit("5") },
    { label: "6", fn: () => digit("6") },
    { label: "−", fn: () => operator("−"), kind: "op" },
    { label: "1", fn: () => digit("1") },
    { label: "2", fn: () => digit("2") },
    { label: "3", fn: () => digit("3") },
    { label: "+", fn: () => operator("+"), kind: "op" },
    { label: "0", fn: () => digit("0") },
    { label: ",", fn: () => digit(",") },
    { label: "back", fn: () => setDisplay(display.length > 1 && !fresh ? display.slice(0, -1) : "0"), kind: "fn", icon: true },
    { label: "=", fn: equals, kind: "op" },
  ];

  return (
    <div className="app calc">
      <div className="calc-display" style={{ fontSize: display.length > 9 ? 42 : 64 }}>{display}</div>
      <div className="calc-keys">
        {keys.map((k) => (
          <button key={k.label} className={(k.kind ?? "") + (op === k.label && fresh ? " active" : "")} onClick={k.fn}>
            {k.icon ? <Icon name="backspace" size={26} /> : k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
