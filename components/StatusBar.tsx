"use client";
import { useNow, pad } from "./hooks";
import Icon from "./Icon";

export default function StatusBar({ light = true }: { light?: boolean }) {
  const now = useNow(1000);
  return (
    <div className="status" style={{ color: light ? "#fff" : "#111" }}>
      <span>{now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : ""}</span>
      <span className="status-r">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="4.3" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="8.6" y="3" width="3" height="9" rx="1" />
          <rect x="12.9" y="0" width="3" height="12" rx="1" />
        </svg>
        <Icon name="wifi" size={14} stroke={2.4} />
        <span className="batt">
          <i style={{ width: "78%" }} />
        </span>
      </span>
    </div>
  );
}
