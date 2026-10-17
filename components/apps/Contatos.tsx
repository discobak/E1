"use client";
import { useMemo, useState } from "react";
import Icon from "../Icon";
import CallScreen from "./CallScreen";
import { useStored } from "../hooks";
import { KEYS, SEED_CONTACTS, Contact, fmtNum, digits, logCall } from "../data";

export default function Contatos() {
  const [contacts, setContacts] = useStored<Contact[]>(KEYS.contacts, SEED_CONTACTS);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [call, setCall] = useState<Contact | null>(null);

  const groups = useMemo(() => {
    const list = contacts
      .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || digits(c.phone).includes(digits(q) || "\u0000"))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const map = new Map<string, Contact[]>();
    for (const c of list) {
      const l = c.name.charAt(0).toUpperCase();
      map.set(l, [...(map.get(l) ?? []), c]);
    }
    return [...map.entries()];
  }, [contacts, q]);

  const current = contacts.find((c) => c.id === sel);

  const save = () => {
    if (!name.trim() || digits(phone).length < 8) return;
    setContacts([...contacts, { id: String(Date.now()), name: name.trim(), phone: digits(phone) }]);
    setName("");
    setPhone("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="app light push">
        <div className="appbar">
          <button onClick={() => setAdding(false)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <h2>Novo contato</h2>
          <button onClick={save} className="txt">Salvar</button>
        </div>
        <div className="form">
          <label>Nome<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" /></label>
          <label>
            Telefone
            <input value={fmtNum(phone)} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="(21) 99999-0000" />
          </label>
        </div>
      </div>
    );
  }

  if (current) {
    return (
      <div className="app light push">
        <div className="appbar">
          <button onClick={() => setSel(null)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <span />
          <button
            aria-label="Excluir"
            onClick={() => {
              setContacts(contacts.filter((c) => c.id !== current.id));
              setSel(null);
            }}
          >
            <Icon name="trash" size={22} />
          </button>
        </div>
        <div className="detail">
          <div className="avatar big">{current.name.charAt(0)}</div>
          <h2>{current.name}</h2>
          <p>{fmtNum(current.phone)}</p>
          <div className="detail-actions">
            <button onClick={() => setCall(current)}>
              <span className="green"><Icon name="phone" size={22} /></span>Ligar
            </button>
            <button onClick={() => setContacts(contacts.map((c) => (c.id === current.id ? { ...c, fav: !c.fav } : c)))}>
              <span className="yellow"><Icon name="star" size={22} fill={current.fav ? "currentColor" : "none"} /></span>
              {current.fav ? "Favorito" : "Favoritar"}
            </button>
          </div>
        </div>
        {call && (
          <CallScreen
            name={call.name}
            phone={call.phone}
            onEnd={(dur, answered) => {
              logCall({ name: call.name, phone: call.phone, type: answered ? "out" : "cancel", dur });
              setCall(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app light">
      <div className="appbar">
        <h2>Contatos</h2>
        <button onClick={() => setAdding(true)} aria-label="Novo contato"><Icon name="plus" size={24} /></button>
      </div>
      <div className="searchbox">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar contatos" />
      </div>
      <div className="list grouped">
        {groups.length === 0 && <div className="empty">Nenhum contato encontrado.</div>}
        {groups.map(([letter, list]) => (
          <div key={letter}>
            <div className="letter">{letter}</div>
            {list.map((c) => (
              <button key={c.id} className="row-item" onClick={() => setSel(c.id)}>
                <span className="avatar">{c.name.charAt(0)}</span>
                <span className="row-main">
                  <b>{c.name}</b>
                  <small>{fmtNum(c.phone)}</small>
                </span>
                {c.fav && <Icon name="star" size={16} fill="#eab308" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
