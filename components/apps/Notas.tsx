"use client";
import { useState } from "react";
import Icon from "../Icon";
import { useStored } from "../hooks";
import { KEYS } from "../data";

type Note = { id: number; text: string };

export default function Notas() {
  const [notes, setNotes] = useStored<Note[]>(KEYS.notes, []);
  const [open, setOpen] = useState<number | null>(null);

  const add = () => {
    const n = { id: Date.now(), text: "" };
    setNotes([n, ...notes]);
    setOpen(n.id);
  };

  const current = notes.find((n) => n.id === open);

  if (current) {
    return (
      <div className="app light push">
        <div className="appbar">
          <button
            onClick={() => {
              if (!current.text.trim()) setNotes(notes.filter((n) => n.id !== current.id));
              setOpen(null);
            }}
          >
            <Icon name="back" size={22} /> <span className="txt">Notas</span>
          </button>
          <button
            aria-label="Excluir nota"
            onClick={() => {
              setNotes(notes.filter((n) => n.id !== current.id));
              setOpen(null);
            }}
          >
            <Icon name="trash" size={22} />
          </button>
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
        <button onClick={add} aria-label="Nova nota"><Icon name="plus" size={24} /></button>
      </div>
      <div className="list">
        {notes.length === 0 && <div className="empty">Nenhuma nota. Toque em + para criar.</div>}
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
