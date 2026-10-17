export type Contact = { id: string; name: string; phone: string; fav?: boolean };
export type CallType = "out" | "in" | "missed" | "cancel";
export type CallLog = { id: string; name: string; phone: string; type: CallType; time: number; dur: number };
export type Photo = { id: string; src: string; time: number };
export type Msg = { me: boolean; text: string; time: number };

export const KEYS = {
  contacts: "celularweb:contatos",
  calls: "celularweb:ligacoes",
  msgs: "celularweb:mensagens",
  photos: "celularweb:fotos",
  notes: "celularweb:notas",
};

export const SEED_CONTACTS: Contact[] = [
  { id: "c1", name: "Mãe", phone: "21987654321", fav: true },
  { id: "c2", name: "Pai", phone: "21976543210", fav: true },
  { id: "c3", name: "Ana Souza", phone: "11998877665", fav: true },
  { id: "c4", name: "Carlos Lima", phone: "21965432109" },
  { id: "c5", name: "Mariana Costa", phone: "31991122334" },
  { id: "c6", name: "João Pedro", phone: "21954321098" },
  { id: "c7", name: "Dr. Roberto", phone: "2132145678" },
  { id: "c8", name: "Pizzaria Bella", phone: "2133334444" },
];

export const digits = (s: string) => s.replace(/\D/g, "");

export function fmtNum(n: string) {
  const d = digits(n).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function nameFor(contacts: Contact[], phone: string) {
  return contacts.find((c) => digits(c.phone) === digits(phone))?.name;
}

export function fmtTime(t: number) {
  const d = new Date(t);
  const now = new Date();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (d.toDateString() === now.toDateString()) return hm;
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return `Ontem, ${hm}`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function seedCalls(): CallLog[] {
  const n = Date.now();
  const m = 60000;
  return [
    { id: "l1", name: "Mãe", phone: "21987654321", type: "in", time: n - 20 * m, dur: 184 },
    { id: "l2", name: "Carlos Lima", phone: "21965432109", type: "missed", time: n - 95 * m, dur: 0 },
    { id: "l3", name: "Ana Souza", phone: "11998877665", type: "out", time: n - 5 * 60 * m, dur: 62 },
    { id: "l4", name: "", phone: "21999990000", type: "cancel", time: n - 26 * 60 * m, dur: 0 },
    { id: "l5", name: "Pai", phone: "21976543210", type: "out", time: n - 30 * 60 * m, dur: 301 },
  ];
}

/** Usado por apps que ligam sem estar dentro do app Telefone. */
export function logCall(entry: Omit<CallLog, "id" | "time">) {
  try {
    const raw = localStorage.getItem(KEYS.calls);
    const list: CallLog[] = raw ? JSON.parse(raw) : seedCalls();
    list.unshift({ ...entry, id: String(Date.now()), time: Date.now() });
    localStorage.setItem(KEYS.calls, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

const svg = (a: string, b: string, c: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='400' height='500' fill='url(#g)'/><circle cx='290' cy='140' r='60' fill='${c}' opacity='.85'/><path d='M0 380 Q120 300 220 370 T400 340 V500 H0Z' fill='rgba(0,0,0,.25)'/></svg>`
  );

export const SAMPLES: Photo[] = [
  { id: "s1", src: svg("#1e3a8a", "#ec4899", "#fde68a"), time: Date.now() - 6 * 86400000 },
  { id: "s2", src: svg("#0f766e", "#a3e635", "#fef9c3"), time: Date.now() - 5 * 86400000 },
  { id: "s3", src: svg("#7c2d12", "#fbbf24", "#fff7ed"), time: Date.now() - 4 * 86400000 },
  { id: "s4", src: svg("#0f172a", "#38bdf8", "#e0f2fe"), time: Date.now() - 3 * 86400000 },
  { id: "s5", src: svg("#581c87", "#f472b6", "#fce7f3"), time: Date.now() - 2 * 86400000 },
  { id: "s6", src: svg("#14532d", "#22d3ee", "#ecfeff"), time: Date.now() - 86400000 },
];
