"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { me: boolean; text: string };
const REPLIES = [
  "Oi! Tudo bem? 😊",
  "Haha, boa!",
  "Entendi, me conta mais.",
  "Pode ser! Que horas?",
  "Combinado 👍",
  "Hmm, deixa eu ver aqui...",
  "Verdade!",
];

export default function Mensagens() {
  const [msgs, setMsgs] = useState<Msg[]>([{ me: false, text: "Olá! Mande uma mensagem 👋" }]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { me: true, text: t }]);
    setText("");
    setTimeout(() => setMsgs((m) => [...m, { me: false, text: REPLIES[Math.floor(Math.random() * REPLIES.length)] }]), 900);
  };

  return (
    <div className="app light chat">
      <div className="appbar"><h2>Bot Amigo</h2></div>
      <div className="chat-body">
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + (m.me ? "me" : "them")}>{m.text}</div>
        ))}
        <div ref={end} />
      </div>
      <div className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Mensagem" />
        <button onClick={send}>➤</button>
      </div>
    </div>
  );
}
