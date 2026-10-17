"use client";
import { useNow, pad } from "./hooks";
import Icon from "./Icon";
import type { Sys } from "./sys";

export default function StatusBar({ light = true, sys }: { light?: boolean; sys: Sys }) {
  const now = useNow(1000);
  return (
    <div className="status" style={{ color: light ? "#fff" : "#111" }}>
      <span className="status-l">
        {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : ""}
        {sys.dnd && <Icon name="moon" size={12} fill="currentColor" stroke={1.5} />}
        {sys.flash && <Icon name="flashlight" size={13} stroke={2} />}
      </span>
      <span className="status-r">
        {sys.plane ? (
          <Icon name="plane" size={14} stroke={2} />
        ) : (
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="4.3" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="8.6" y="3" width="3" height="9" rx="1" />
            <rect x="12.9" y="0" width="3" height="12" rx="1" />
          </svg>
        )}
        {sys.wifi && !sys.plane && <Icon name="wifi" size={14} stroke={2.4} />}
        {sys.bt && !sys.plane && <Icon name="bluetooth" size={12} stroke={2.4} />}
        <span className="batt" style={sys.saver ? { color: "#facc15" } : undefined}>
          <i style={{ width: "78%" }} />
        </span>
      </span>
    </div>
  );
}
