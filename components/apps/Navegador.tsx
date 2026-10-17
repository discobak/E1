"use client";
import { useState } from "react";
import Icon from "../Icon";

const SHORTCUTS = [
  { name: "Wikipédia", url: "https://pt.m.wikipedia.org" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org" },
  { name: "Wikinotícias", url: "https://pt.m.wikinews.org" },
  { name: "Wikcionário", url: "https://pt.m.wiktionary.org" },
];

function normalize(input: string) {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (!t.includes(" ") && t.includes(".")) return "https://" + t;
  return `https://pt.m.wikipedia.org/w/index.php?search=${encodeURIComponent(t)}`;
}

export default function Navegador() {
  const [stack, setStack] = useState<string[]>([]);
  const [idx, setIdx] = useState(-1);
  const [text, setText] = useState("");
  const [reload, setReload] = useState(0);

  const url = idx >= 0 ? stack[idx] : null;

  const go = (raw: string) => {
    const u = normalize(raw);
    if (!u) return;
    const next = [...stack.slice(0, idx + 1), u];
    setStack(next);
    setIdx(next.length - 1);
    setText(u);
  };

  const back = () => {
    if (idx < 0) return;
    const n = idx - 1;
    setIdx(n);
    setText(n >= 0 ? stack[n] : "");
  };
  const forward = () => {
    if (idx >= stack.length - 1) return;
    setIdx(idx + 1);
    setText(stack[idx + 1]);
  };

  return (
    <div className="app light browser">
      <div className="urlbar">
        <button onClick={back} disabled={idx < 0} aria-label="Voltar"><Icon name="back" size={22} /></button>
        <button onClick={forward} disabled={idx >= stack.length - 1} aria-label="Avançar"><Icon name="forward" size={22} /></button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(text);
          }}
        >
          <Icon name="search" size={16} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pesquisar ou digitar endereço" inputMode="url" />
        </form>
        <button onClick={() => setReload(reload + 1)} disabled={!url} aria-label="Recarregar"><Icon name="refresh" size={20} /></button>
      </div>

      {url ? (
        <>
          <iframe
            key={url + reload}
            src={url}
            title="Página"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          <div className="browser-foot">
            <span>Alguns sites não permitem abrir aqui.</span>
            <button onClick={() => window.open(url, "_blank", "noopener")}>
              Abrir fora <Icon name="external" size={14} />
            </button>
          </div>
        </>
      ) : (
        <div className="start">
          <div className="start-logo"><Icon name="globe" size={54} stroke={1.4} /></div>
          <h2>Navegador</h2>
          <p>Digite um endereço ou pesquise na Wikipédia.</p>
          <div className="shortcuts">
            {SHORTCUTS.map((s) => (
              <button key={s.url} onClick={() => go(s.url)}>
                <span><Icon name="globe" size={20} /></span>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
