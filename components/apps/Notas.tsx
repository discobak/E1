"use client";
import { useEffect, useState } from "react";

type Note = { id: number; text: string };
const KEY = "celularweb:notas";

export default function Notas() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {}
  }, [notes, loaded]);

  const add = () => {
    const n = { id: Date.now(), text: "" };
    setNotes([n, ...notes]);
    setOpen(n.id);
  };

  const current = notes.find((n) => n.id === open);

  if (current) {
    return (
      <div className="app light">
        <div className="appbar">
          <button onClick={() => { if (!current.text.trim()) setNotes(notes.filter((n) => n.id !== current.id)); setOpen(null); }}>‹ Notas</button>
          <button onClick={() => { setNotes(notes.filter((n) => n.id !== current.id)); setOpen(null); }}>🗑</button>
        </div>
        <textarea
          autoFocus
          className="note-area"
          placeholder="Escreva sua nota..."
          value={current.text}
          onChange={(e) => setNotes(notes.map((n) => (n.id === current.id ? { ...n, text: e.target.value } : n)))}
        />
      </div>
    );
  }

  return (
    <div className="app light">
      <div className="appbar">
        <h2>Notas</h2>
        <button onClick={add}>＋</button>
      </div>
      <div className="list">
        {notes.length === 0 && <div className="muted pad">Nenhuma nota. Toque em ＋ para criar.</div>}
        {notes.map((n) => (
          <button key={n.id} className="list-item" onClick={() => setOpen(n.id)}>
            <b>{n.text.split("\n")[0] || "Nova nota"}</b>
            <small>{n.text.split("\n")[1] || "Sem texto adicional"}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
