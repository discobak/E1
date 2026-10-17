"use client";
import { useState } from "react";
import Icon, { IconName } from "../Icon";
import CallScreen from "./CallScreen";
import { useStored } from "../hooks";
import {
  KEYS,
  SEED_CONTACTS,
  Contact,
  CallLog,
  seedCalls,
  fmtNum,
  digits,
  fmtTime,
  nameFor,
} from "../data";

type Tab = "fav" | "rec" | "key";

const LETTERS: Record<string, string> = {
  "2": "ABC", "3": "DEF", "4": "GHI", "5": "JKL", "6": "MNO", "7": "PQRS", "8": "TUV", "9": "WXYZ",
};
const KEYS_LIST = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
const TITLES: Record<Tab, string> = { fav: "Favoritos", rec: "Recentes", key: "Teclado" };
const STATUS = { out: "Efetuada", in: "Recebida", missed: "Perdida", cancel: "Cancelada" } as const;

export default function Telefone() {
  const [contacts] = useStored<Contact[]>(KEYS.contacts, SEED_CONTACTS);
  const [calls, setCalls] = useStored<CallLog[]>(KEYS.calls, seedCalls());
  const [tab, setTab] = useState<Tab>("rec");
  const [num, setNum] = useState("");
  const [call, setCall] = useState<{ name: string; phone: string } | null>(null);
  const [menu, setMenu] = useState(false);

  const start = (phone: string, name?: string) => {
    if (digits(phone).length < 2) return;
    setCall({ phone, name: name ?? nameFor(contacts, phone) ?? "" });
  };

  const end = (dur: number, answered: boolean) => {
    if (!call) return;
    const entry: CallLog = {
      id: String(Date.now()),
      name: call.name,
      phone: call.phone,
      type: answered ? "out" : "cancel",
      time: Date.now(),
      dur,
    };
    setCalls((c) => [entry, ...c].slice(0, 50));
    setCall(null);
    setNum("");
  };

  const favs = contacts.filter((c) => c.fav);
  const match = digits(num).length >= 2 ? contacts.find((c) => digits(c.phone).includes(digits(num))) : undefined;

  const NAV: { id: Tab; label: string; icon: IconName }[] = [
    { id: "fav", label: "Favoritos", icon: "star" },
    { id: "rec", label: "Recentes", icon: "history" },
    { id: "key", label: "Teclado", icon: "keypad" },
  ];

  return (
    <div className="app tel">
      <div className="tel-head">
        <h1>Telefone</h1>
        <button aria-label="Mais opções" onClick={() => setMenu(!menu)}>
          <Icon name="more" size={22} />
        </button>
        {menu && (
          <>
            <div className="menu-backdrop" onClick={() => setMenu(false)} />
            <div className="menu">
              <button
                onClick={() => {
                  setCalls([]);
                  setMenu(false);
                }}
              >
                Limpar recentes
              </button>
            </div>
          </>
        )}
      </div>

      <div className="tel-title">{TITLES[tab]}</div>

      <div className="tel-body" key={tab}>
        {tab === "fav" && (
          <div className="rows">
            {favs.length === 0 && <div className="empty">Nenhum favorito. Marque contatos com a estrela no app Contatos.</div>}
            {favs.map((c) => (
              <button key={c.id} className="row-item" onClick={() => start(c.phone, c.name)}>
                <span className="avatar">{c.name.charAt(0)}</span>
                <span className="row-main">
                  <b>{c.name}</b>
                  <small>{fmtNum(c.phone)}</small>
                </span>
                <span className="row-act">
                  <Icon name="phone" size={20} />
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "rec" && (
          <div className="rows">
            {calls.length === 0 && <div className="empty">Sem chamadas recentes.</div>}
            {calls.map((l) => {
              const name = l.name || nameFor(contacts, l.phone) || "";
              return (
                <button key={l.id} className="row-item" onClick={() => start(l.phone, name)}>
                  <span className={"avatar phone-av" + (l.type === "missed" ? " red" : "")}>
                    <Icon name={l.type === "missed" ? "phoneIn" : "phone"} size={20} />
                  </span>
                  <span className="row-main">
                    <b className={l.type === "missed" ? "red" : ""}>{name || fmtNum(l.phone)}</b>
                    <small>
                      {fmtTime(l.time)} · {STATUS[l.type]}
                    </small>
                  </span>
                  <span className="row-act">
                    <Icon name="phone" size={20} />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {tab === "key" && (
          <div className="dialer">
            <div className="dial-number">{fmtNum(num) || " "}</div>
            <div className="dial-match">{match ? match.name : " "}</div>
            <div className="dial-keys">
              {KEYS_LIST.map((k) => (
                <button key={k} onClick={() => setNum((n) => (n + k).slice(0, 11))}>
                  <b>{k}</b>
                  <small>{LETTERS[k] ?? " "}</small>
                </button>
              ))}
            </div>
            <div className="dial-actions">
              <span />
              <button className="call-btn" aria-label="Ligar" disabled={digits(num).length < 2} onClick={() => start(num, match?.name)}>
                <Icon name="phone" size={28} />
              </button>
              <button className="back-btn" aria-label="Apagar" style={{ visibility: num ? "visible" : "hidden" }} onClick={() => setNum(num.slice(0, -1))}>
                <Icon name="backspace" size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button key={n.id} className={tab === n.id ? "on" : ""} onClick={() => setTab(n.id)}>
            <span className="pillnav">
              <Icon name={n.icon} size={22} fill={tab === n.id && n.id === "fav" ? "currentColor" : "none"} />
            </span>
            {n.label}
          </button>
        ))}
      </nav>

      {call && <CallScreen name={call.name} phone={call.phone} onEnd={end} />}
    </div>
  );
}
