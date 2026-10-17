"use client";
import { useState } from "react";

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winner(b: (string | null)[]) {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "empate" : null;
}

export default function Jogo() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const w = winner(board);

  const play = (i: number) => {
    if (board[i] || w) return;
    const b = [...board];
    b[i] = turn;
    setBoard(b);
    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <div className="app light">
      <div className="appbar"><h2>Jogo da Velha</h2></div>
      <div className="center-col">
        <div className="muted">{w ? (w === "empate" ? "Deu empate!" : `Vitória do ${w}! 🎉`) : `Vez do ${turn}`}</div>
        <div className="ttt">
          {board.map((c, i) => (
            <button key={i} className={c ?? ""} onClick={() => play(i)}>{c}</button>
          ))}
        </div>
        <button className="pill" onClick={() => { setBoard(Array(9).fill(null)); setTurn("X"); }}>Reiniciar</button>
      </div>
    </div>
  );
}
