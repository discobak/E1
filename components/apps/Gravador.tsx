"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";

type Rec = { id: string; name: string; src: string; dur: number; time: number; peaks?: number[] };

const CONFIE: Rec = { id: "confie", name: "Confie.", src: "/confie.wav", dur: 25.2, time: Date.now() - 86400000 };

const fmt = (s: number) => {
  s = Math.max(0, s);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${String(m).padStart(2, "0")}:${r.toFixed(1).padStart(4, "0")}`;
};

const BAR = 3;
const GAP = 3;
const RED = "#ff453a";

function setupCanvas(c: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth;
  const h = c.clientHeight;
  if (c.width !== w * dpr || c.height !== h * dpr) {
    c.width = w * dpr;
    c.height = h * dpr;
  }
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function bar(ctx: CanvasRenderingContext2D, x: number, h: number, v: number, color: string) {
  const bh = Math.max(3, v * (h - 12));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, (h - bh) / 2, BAR, bh, 2);
  ctx.fill();
}

async function getPeaks(src: string, n = 500): Promise<number[]> {
  const buf = await (await fetch(src)).arrayBuffer();
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AC();
  const audio = await ctx.decodeAudioData(buf);
  ctx.close();
  const data = audio.getChannelData(0);
  const step = Math.floor(data.length / n) || 1;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let j = i * step; j < Math.min(data.length, (i + 1) * step); j += 8) m = Math.max(m, Math.abs(data[j]));
    out.push(m);
  }
  const top = Math.max(...out, 0.01);
  return out.map((v) => Math.pow(v / top, 0.8));
}

/* ───────────── Player ───────────── */
function Player({ rec, onBack }: { rec: Rec; onBack: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(rec.peaks ?? null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(rec.dur);
  const curRef = useRef(0);
  const durRef = useRef(rec.dur);

  useEffect(() => {
    const a = new Audio(rec.src);
    a.preload = "auto";
    audioRef.current = a;
    a.onloadedmetadata = () => {
      if (isFinite(a.duration) && a.duration > 0) {
        setDur(a.duration);
        durRef.current = a.duration;
      }
    };
    a.onended = () => {
      setPlaying(false);
      a.currentTime = 0;
      curRef.current = 0;
      setCur(0);
    };
    if (!rec.peaks) getPeaks(rec.src).then(setPeaks).catch(() => setPeaks(Array(200).fill(0.2)));
    return () => {
      a.pause();
      a.src = "";
    };
  }, [rec]);

  // desenho: waveform rolando, playhead no centro
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = canvas.current;
      const a = audioRef.current;
      if (c && a) {
        curRef.current = a.currentTime;
        const { ctx, w, h } = setupCanvas(c);
        const pk = peaks ?? [];
        const total = pk.length * (BAR + GAP);
        const prog = durRef.current ? curRef.current / durRef.current : 0;
        const off = w / 2 - prog * total;
        for (let i = 0; i < pk.length; i++) {
          const x = off + i * (BAR + GAP);
          if (x < -BAR || x > w) continue;
          const played = x + BAR / 2 <= w / 2;
          bar(ctx, x, h, pk[i], played ? RED : "rgba(255,255,255,.35)");
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(w / 2 - 1, 0, 2, h);
        setCur(curRef.current);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [peaks]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  };
  const skip = (d: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(durRef.current, Math.max(0, a.currentTime + d));
  };
  const seek = (v: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = v;
  };

  return (
    <div className="app rec push">
      <div className="appbar">
        <button onClick={onBack}>
          <Icon name="back" size={22} /> <span className="txt">Gravações</span>
        </button>
        <span />
      </div>
      <div className="rec-title">{rec.name}</div>
      <div className="rec-sub">{new Date(rec.time).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}</div>
      <div className="rec-wave tall">
        <canvas ref={canvas} />
      </div>
      <input className="rec-seek" type="range" min={0} max={dur} step={0.01} value={Math.min(cur, dur)} onChange={(e) => seek(+e.target.value)} />
      <div className="rec-times">
        <span>{fmt(cur)}</span>
        <span>-{fmt(dur - cur)}</span>
      </div>
      <div className="rec-controls">
        <button aria-label="Voltar 15s" onClick={() => skip(-15)}>
          <Icon name="refresh" size={26} />
          <small>15</small>
        </button>
        <button className="rec-play" aria-label={playing ? "Pausar" : "Tocar"} onClick={toggle}>
          <Icon name={playing ? "pause" : "play"} size={30} fill="#000" stroke={0} />
        </button>
        <button aria-label="Avançar 15s" onClick={() => skip(15)}>
          <Icon name="refresh" size={26} className="flipx" />
          <small>15</small>
        </button>
      </div>
    </div>
  );
}

/* ───────────── App ───────────── */
export default function Gravador() {
  const [view, setView] = useState<"rec" | "list">("rec");
  const [recs, setRecs] = useState<Rec[]>([CONFIE]);
  const [playing, setPlaying] = useState<Rec | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [err, setErr] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({
    stream: null as MediaStream | null,
    ctx: null as AudioContext | null,
    analyser: null as AnalyserNode | null,
    mr: null as MediaRecorder | null,
    chunks: [] as Blob[],
    levels: [] as number[],
    t0: 0,
    lastPush: 0,
    on: false,
  });

  // desenho da onda (ao vivo ou parada)
  useEffect(() => {
    if (view !== "rec") return;
    let raf = 0;
    const buf = new Uint8Array(1024);
    const draw = () => {
      const c = canvas.current;
      if (c) {
        const L = live.current;
        const { ctx, w, h } = setupCanvas(c);
        if (L.on && L.analyser) {
          L.analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const lvl = Math.min(1, Math.sqrt(sum / buf.length) * 4.5);
          const now = performance.now();
          if (now - L.lastPush > 55) {
            L.levels.push(lvl);
            L.lastPush = now;
          }
          setElapsed((now - L.t0) / 1000);
        }
        const n = Math.ceil(w / (BAR + GAP));
        const lv = L.levels;
        for (let i = 0; i < n; i++) {
          const x = w - (i + 1) * (BAR + GAP);
          const v = L.on ? lv[lv.length - 1 - i] : undefined;
          if (v === undefined) {
            ctx.fillStyle = "rgba(255,255,255,.25)";
            ctx.fillRect(x, h / 2 - 1, BAR, 2);
          } else bar(ctx, x, h, Math.max(0.04, v), RED);
        }
        ctx.fillStyle = RED;
        ctx.fillRect(w - 20, 0, 2, h);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [view]);

  const stopAll = (save: boolean) => {
    const L = live.current;
    L.on = false;
    const dur = (performance.now() - L.t0) / 1000;
    if (L.mr && L.mr.state !== "inactive") {
      L.mr.onstop = () => {
        if (save && L.chunks.length) {
          const blob = new Blob(L.chunks, { type: L.mr!.mimeType || "audio/webm" });
          const n = recs.filter((r) => r.id !== "confie").length + 1;
          const peaks = L.levels.length > 4 ? L.levels.map((v) => Math.max(0.05, v)) : [0.1, 0.1];
          setRecs((r) => [...r, { id: String(Date.now()), name: `Gravação ${n}`, src: URL.createObjectURL(blob), dur, time: Date.now(), peaks }]);
        }
      };
      L.mr.stop();
    }
    L.stream?.getTracks().forEach((t) => t.stop());
    L.ctx?.close();
    L.stream = null;
    L.ctx = null;
    L.analyser = null;
    setRecording(false);
  };

  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const mr = new MediaRecorder(stream);
      const L = live.current;
      L.stream = stream;
      L.ctx = ctx;
      L.analyser = analyser;
      L.mr = mr;
      L.chunks = [];
      L.levels = [];
      L.t0 = performance.now();
      L.on = true;
      mr.ondataavailable = (e) => e.data.size && L.chunks.push(e.data);
      mr.start();
      setElapsed(0);
      setRecording(true);
    } catch {
      setErr("Permita o acesso ao microfone para gravar.");
    }
  };

  useEffect(() => () => {
    const L = live.current;
    L.on = false;
    L.stream?.getTracks().forEach((t) => t.stop());
    L.ctx?.close();
  }, []);

  if (playing) return <Player rec={playing} onBack={() => setPlaying(null)} />;

  if (view === "list")
    return (
      <div className="app rec push">
        <div className="appbar">
          <button onClick={() => setView("rec")}>
            <Icon name="back" size={22} /> <span className="txt">Gravador</span>
          </button>
          <span />
        </div>
        <h2 className="rec-h">Todas as gravações</h2>
        <div className="list">
          {recs.map((r) => (
            <button key={r.id} className="rec-row" onClick={() => setPlaying(r)}>
              <div>
                <b>{r.name}</b>
                <small>{new Date(r.time).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}</small>
              </div>
              <span>{fmt(r.dur).replace(/^00:/, "0:")}</span>
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="app rec">
      <div className="appbar">
        <h2>Gravador de voz</h2>
        <button aria-label="Ver gravações" onClick={() => setView("list")}>
          <Icon name="list" size={24} />
        </button>
      </div>
      <div className="rec-main">
        <div className="rec-time">{fmt(recording ? elapsed : 0)}</div>
        <div className="rec-wave">
          <canvas ref={canvas} />
        </div>
        {err && <div className="rec-err">{err}</div>}
      </div>
      <div className="rec-bottom">
        <button className={"rec-btn" + (recording ? " on" : "")} aria-label={recording ? "Parar" : "Gravar"} onClick={() => (recording ? stopAll(true) : start())}>
          <span />
        </button>
      </div>
    </div>
  );
}
