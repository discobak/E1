"use client";
import { useNow, pad } from "./hooks";

export default function StatusBar({ light = true }: { light?: boolean }) {
  const now = useNow(1000);
  return (
    <div className="status" style={{ color: light ? "#fff" : "#111" }}>
      <span>{now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : ""}</span>
      <span className="status-r">
        <span>▂▄▆█</span>
        <span>◠</span>
        <span>🔋 87%</span>
      </span>
    </div>
  );
}
