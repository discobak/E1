"use client";
import { useState } from "react";

export default function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const calc = (a: number, b: number, o: string) =>
    o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : o === "÷" ? (b === 0 ? NaN : a / b) : b;

  const fmt = (n: number) => (Number.isNaN(n) ? "Erro" : String(parseFloat(n.toPrecision(10))));

  const digit = (d: string) => {
    if (fresh) {
      setDisplay(d === "," ? "0," : d);
      setFresh(false);
    } else {
      if (d === "," && display.includes(",")) return;
      setDisplay(display === "0" && d !== "," ? d : display + d);
    }
  };

  const cur = () => parseFloat(display.replace(",", "."));
  const show = (n: number) => fmt(n).replace(".", ",");

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
    const r = calc(prev, cur(), op);
    setDisplay(show(r));
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

  const rows: [string, () => void, string?][][] = [
    [["C", clear, "fn"], ["±", () => setDisplay(show(-cur())), "fn"], ["%", () => setDisplay(show(cur() / 100)), "fn"], ["÷", () => operator("÷"), "op"]],
    [["7", () => digit("7")], ["8", () => digit("8")], ["9", () => digit("9")], ["×", () => operator("×"), "op"]],
    [["4", () => digit("4")], ["5", () => digit("5")], ["6", () => digit("6")], ["−", () => operator("−"), "op"]],
    [["1", () => digit("1")], ["2", () => digit("2")], ["3", () => digit("3")], ["+", () => operator("+"), "op"]],
    [["0", () => digit("0")], [",", () => digit(",")], ["⌫", () => setDisplay(display.length > 1 && !fresh ? display.slice(0, -1) : "0"), "fn"], ["=", equals, "op"]],
  ];

  return (
    <div className="app calc">
      <div className="calc-display">{display}</div>
      <div className="calc-keys">
        {rows.flat().map(([label, fn, kind]) => (
          <button key={label} className={kind ?? ""} onClick={fn}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
