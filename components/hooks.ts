"use client";
import { useEffect, useState } from "react";

export function useNow(interval = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

/** Estado salvo no localStorage (carrega depois da montagem, sem quebrar o SSR). */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [value, key, ready]);

  return [value, setValue, ready] as const;
}

export const pad = (n: number) => String(n).padStart(2, "0");

export const WALLPAPERS = [
  "linear-gradient(160deg,#3b3b40,#1a1a1d 55%,#08080a)",
  "linear-gradient(160deg,#1e3a8a,#7c3aed 55%,#ec4899)",
  "linear-gradient(160deg,#0f172a,#0e7490 60%,#34d399)",
  "linear-gradient(160deg,#7f1d1d,#ea580c 55%,#fbbf24)",
  "linear-gradient(160deg,#111827,#374151 60%,#9ca3af)",
  "linear-gradient(160deg,#064e3b,#16a34a 60%,#bef264)",
];
