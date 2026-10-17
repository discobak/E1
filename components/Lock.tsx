"use client";
import { useRef, useState } from "react";
import { useNow, pad, WALLPAPERS } from "./hooks";
import Icon from "./Icon";

const PASSWORD = "1234";
const DAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export default function Lock({ wall, onUnlock }: { wall: number; onUnlock: () => void }) {
  const now = useNow(1000);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const startY = useRef(0);

  const down = (e: React.PointerEvent) => {
    if (showPin) return;
    startY.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDy(Math.min(0, e.clientY - startY.current));
  };
  const up = () => {
    if (!dragging) return;
    setDragging(false);
    if (dy < -90) setShowPin(true);
    setDy(0);
  };

  const press = (d: string) => {
    if (error || leaving) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === PASSWORD) {
        setTimeout(() => {
          setLeaving(true);
          setTimeout(onUnlock, 380);
        }, 140);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 600);
      }
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const translate = leaving ? "-100%" : `${dy}px`;

  return (
    <div
      className="lock"
      style={{
        background: WALLPAPERS[wall],
        transform: `translateY(${translate})`,
        transition: dragging ? "none" : "transform .38s cubic-bezier(.22,.9,.28,1)",
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div className={"lock-top" + (showPin ? " small" : "")}>
        <div className="lock-date">
          {now ? `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}` : ""}
        </div>
        <div className="lock-time">{now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : ""}</div>
      </div>

      {!showPin ? (
        <button className="swipe" onClick={() => setShowPin(true)}>
          <Icon name="back" size={26} className="swipe-arrow" />
          <span>Deslize para cima para desbloquear</span>
        </button>
      ) : (
        <div className="pin">
          <div className="pin-title">{error ? "Senha incorreta" : "Digite a senha"}</div>
          <div className={"dots" + (error ? " shake" : "")}>
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={i < pin.length ? "on" : ""} />
            ))}
          </div>
          <div className="keypad">
            {keys.map((k) => (
              <button key={k} onClick={() => press(k)}>
                {k}
              </button>
            ))}
            <button
              className="ghost"
              aria-label="Cancelar"
              onClick={() => {
                setShowPin(false);
                setPin("");
              }}
            >
              <Icon name="x" size={22} />
            </button>
            <button onClick={() => press("0")}>0</button>
            <button className="ghost" aria-label="Apagar" onClick={() => setPin((p) => p.slice(0, -1))}>
              <Icon name="backspace" size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
