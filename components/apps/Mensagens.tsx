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

const MAY_ID = "may";
const MAY_KEY = "celularweb:may-desbloqueada";
const MAY: Contact = { id: MAY_ID, name: "May", phone: "21900000000" };
const T0 = Date.now();
const MAY_MSGS: Msg[] = [
  { me: false, text: "SEU FILHO DA PUTA NUNCA MAIS FALA COMIGO NOTE.", time: T0 - 40 * 60000 },
  { me: true, text: "vsf mn", time: T0 - 39 * 60000 },
];

/** Barulho de glitch gerado na hora (sem arquivo de áudio). */
function glitchSound() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const dur = 0.9;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let hold = 0, val = 0;
    for (let i = 0; i < d.length; i++) {
      if (i % Math.floor(20 + Math.random() * 400) === 0) hold = Math.random() * 2 - 1;
      val = Math.random() < 0.5 ? hold : Math.random() * 2 - 1;
      const gate = Math.sin(i / 900) > -0.2 || Math.random() < 0.15 ? 1 : 0;
      d[i] = val * gate * (1 - i / d.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    for (let t = 0; t < dur; t += 0.06) osc.frequency.setValueAtTime(100 + Math.random() * 1800, ctx.currentTime + t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.08, ctx.currentTime);
    og.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    src.connect(g).connect(ctx.destination);
    osc.connect(og).connect(ctx.destination);
    src.start();
    osc.start();
    osc.stop(ctx.currentTime + dur);
    setTimeout(() => ctx.close(), dur * 1000 + 200);
  } catch {}
}

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
  const [unblocked, setUnblocked] = useStored<boolean>(MAY_KEY, false);
  const [glitch, setGlitch] = useState(false);
  const [entering, setEntering] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const isMay = open === MAY_ID;
  const blocked = isMay && !unblocked;
  const thread = open ? (isMay ? [...MAY_MSGS, ...(msgs[MAY_ID] ?? [])] : msgs[open] ?? []) : [];

  // depois de desbloqueada, a May fica "bugada": entrar na conversa dispara glitch de novo
  const openThread = (id: string) => {
    if (id === MAY_ID && unblocked) {
      if (entering) return;
      setEntering(true);
      glitchSound();
      setTimeout(() => {
        setOpen(id);
        setPicking(false);
        setEntering(false);
      }, 900);
      return;
    }
    setOpen(id);
    setPicking(false);
  };

  const unblock = () => {
    if (glitch) return;
    setGlitch(true);
    glitchSound();
    setTimeout(() => {
      setUnblocked(true);
      setGlitch(false);
      window.dispatchEvent(new Event("celular:crash"));
    }, 900);
  };
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing, open]);

  const send = () => {
    const t = text.trim();
    if (!t || !open || blocked) return;
    const id = open;
    setMsgs((m) => ({ ...m, [id]: [...(m[id] ?? []), { me: true, text: t, time: Date.now() }] }));
    setText("");
    if (id === MAY_ID) return;
    setTimeout(() => setTyping(true), 500);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => ({
        ...m,
        [id]: [...(m[id] ?? []), { me: false, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: Date.now() }],
      }));
    }, 1900);
  };

  const allContacts = contacts.some((c) => c.id === MAY_ID) ? contacts : [...contacts, MAY];
  const who = allContacts.find((c) => c.id === open);

  if (picking) {
    return (
      <div className={"app light push" + (entering ? " glitching" : "")}>
        {entering && <div className="glitch-overlay" />}
        <div className="appbar">
          <button onClick={() => setPicking(false)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <h2>Nova mensagem</h2>
          <span />
        </div>
        <div className="list">
          {[...allContacts].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((c) => (
            <button
              key={c.id}
              className="row-item"
              onClick={() => openThread(c.id)}
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
      <div className={"app light chat push" + (glitch ? " glitching" : "") + (isMay && unblocked ? " buggy" : "")}>
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
          {blocked && (
            <div className="block-note">
              <span>Você bloqueou essa pessoa</span>
              <button onClick={unblock}>Desbloquear</button>
            </div>
          )}
          <div ref={end} />
        </div>
        {glitch && <div className="glitch-overlay" />}
        <div className={"chat-input" + (blocked ? " blurred" : "")}>
          <input disabled={blocked} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Mensagem" />
          <button onClick={send} aria-label="Enviar"><Icon name="send" size={18} /></button>
        </div>
      </div>
    );
  }

  const all: Record<string, Msg[]> = { ...msgs, [MAY_ID]: [...MAY_MSGS, ...(msgs[MAY_ID] ?? [])] };
  const ids = Object.keys(all).filter((id) => (all[id]?.length ?? 0) > 0 && allContacts.some((c) => c.id === id));
  ids.sort((a, b) => all[b][all[b].length - 1].time - all[a][all[a].length - 1].time);

  return (
    <div className={"app light" + (entering ? " glitching" : "")}>
      {entering && <div className="glitch-overlay" />}
      <div className="appbar">
        <h2>Mensagens</h2>
        <button onClick={() => setPicking(true)} aria-label="Nova mensagem"><Icon name="edit" size={22} /></button>
      </div>
      <div className="list">
        {ids.length === 0 && <div className="empty">Nenhuma conversa. Toque no lápis para começar.</div>}
        {ids.map((id) => {
          const c = allContacts.find((x) => x.id === id)!;
          const last = all[id][all[id].length - 1];
          return (
            <button key={id} className={"row-item" + (id === MAY_ID && unblocked ? " buggy" : "")} onClick={() => openThread(id)}>
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
