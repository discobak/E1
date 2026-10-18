export type Sys = {
  wifi: boolean;
  bt: boolean;
  plane: boolean;
  dnd: boolean;
  flash: boolean;
  saver: boolean;
  rotate: boolean;
  dark: boolean;
  volume: number;
};

export type BoolKey = Exclude<keyof Sys, "volume">;

export const DEFAULT_SYS: Sys = {
  wifi: true,
  bt: false,
  plane: false,
  dnd: false,
  flash: false,
  saver: false,
  rotate: true,
  dark: true,
  volume: 60,
};

/** Liga/desliga uma configuração (modo avião desliga Wi-Fi e Bluetooth). */
export function toggleSys(s: Sys, k: BoolKey): Sys {
  const v = !s[k];
  if (k === "plane") return { ...s, plane: v, wifi: !v, bt: v ? false : s.bt };
  if ((k === "wifi" || k === "bt") && v) return { ...s, [k]: true, plane: false };
  return { ...s, [k]: v };
}
