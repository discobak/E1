"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { useStored } from "../hooks";
import { KEYS, SEED_CONTACTS, Contact, Msg } from "../data";

const now = () => Date.now();
const SEED: Record<string, Msg[]> = {
  c1: [{ me: false, text: "Chegou bem? Me avisa quando entrar em casa.", time: now() - 3 * 3600000 }],
  c3: [
    { me: false, text: "Vamos almoçar amanhã?", time: now() - 26 * 3600000 },
    { me: true, text: "Bora! Qual horário?", time: now() - 25 * 3600000 },
  ],
};
const REPLIES = [
  "Oi! Tudo bem?",
  "Haha, boa!",
  "Entendi, me conta mais.",
  "Pode ser! Que horas?",
  "Combinado.",
  "Hmm, deixa eu ver aqui...",
  "Verdade!",
  "Já estou chegando.",
];

const hm = (t: number) => {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function Mensagens() {
  const [contacts] = useStored<Contact[]>(KEYS.contacts, SEED_CONTACTS);
  const [msgs, setMsgs] = useStored<Record<string, Msg[]>>(KEYS.msgs, SEED);
  const [open, setOpen] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const thread = open ? msgs[open] ?? [] : [];
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing, open]);

  const send = () => {
    const t = text.trim();
    if (!t || !open) return;
    const id = open;
    setMsgs((m) => ({ ...m, [id]: [...(m[id] ?? []), { me: true, text: t, time: Date.now() }] }));
    setText("");
    setTimeout(() => setTyping(true), 500);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => ({
        ...m,
        [id]: [...(m[id] ?? []), { me: false, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: Date.now() }],
      }));
    }, 1900);
  };

  const who = contacts.find((c) => c.id === open);

  if (picking) {
    return (
      <div className="app light push">
        <div className="appbar">
          <button onClick={() => setPicking(false)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <h2>Nova mensagem</h2>
          <span />
        </div>
        <div className="list">
          {[...contacts].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((c) => (
            <button
              key={c.id}
              className="row-item"
              onClick={() => {
                setOpen(c.id);
                setPicking(false);
              }}
            >
              <span className="avatar">{c.name.charAt(0)}</span>
              <span className="row-main"><b>{c.name}</b></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (open && who) {
    return (
      <div className="app light chat push">
        <div className="appbar chat-bar">
          <button onClick={() => setOpen(null)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <span className="avatar sm">{who.name.charAt(0)}</span>
          <h2>{who.name}</h2>
        </div>
        <div className="chat-body">
          {thread.length === 0 && <div className="empty">Envie a primeira mensagem para {who.name}.</div>}
          {thread.map((m, i) => (
            <div key={i} className={"bubble " + (m.me ? "me" : "them")}>
              {m.text}
              <small>{hm(m.time)}</small>
            </div>
          ))}
          {typing && (
            <div className="bubble them typing"><i /><i /><i /></div>
          )}
          <div ref={end} />
        </div>
        <div className="chat-input">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Mensagem" />
          <button onClick={send} aria-label="Enviar"><Icon name="send" size={18} /></button>
        </div>
      </div>
    );
  }

  const ids = Object.keys(msgs).filter((id) => (msgs[id]?.length ?? 0) > 0 && contacts.some((c) => c.id === id));
  ids.sort((a, b) => msgs[b][msgs[b].length - 1].time - msgs[a][msgs[a].length - 1].time);

  return (
    <div className="app light">
      <div className="appbar">
        <h2>Mensagens</h2>
        <button onClick={() => setPicking(true)} aria-label="Nova mensagem"><Icon name="edit" size={22} /></button>
      </div>
      <div className="list">
        {ids.length === 0 && <div className="empty">Nenhuma conversa. Toque no lápis para começar.</div>}
        {ids.map((id) => {
          const c = contacts.find((x) => x.id === id)!;
          const last = msgs[id][msgs[id].length - 1];
          return (
            <button key={id} className="row-item" onClick={() => setOpen(id)}>
              <span className="avatar">{c.name.charAt(0)}</span>
              <span className="row-main">
                <b>{c.name}</b>
                <small className="clip">{last.me ? "Você: " : ""}{last.text}</small>
              </span>
              <small className="when">{hm(last.time)}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
