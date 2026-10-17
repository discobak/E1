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

export const pad = (n: number) => String(n).padStart(2, "0");

export const WALLPAPERS = [
  "linear-gradient(160deg,#1e3a8a,#7c3aed 55%,#ec4899)",
  "linear-gradient(160deg,#0f172a,#0e7490 60%,#34d399)",
  "linear-gradient(160deg,#7f1d1d,#ea580c 55%,#fbbf24)",
  "linear-gradient(160deg,#111827,#374151 60%,#9ca3af)",
  "linear-gradient(160deg,#064e3b,#16a34a 60%,#bef264)",
];
