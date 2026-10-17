"use client";
import type { ComponentType } from "react";
import Calculadora from "./Calculadora";
import Relogio from "./Relogio";
import Notas from "./Notas";
import Telefone from "./Telefone";
import Mensagens from "./Mensagens";
import Config from "./Config";
import Jogo from "./Jogo";
import Calendario from "./Calendario";

export type AppProps = {
  wall: number;
  setWall: (n: number) => void;
  brightness: number;
  setBrightness: (n: number) => void;
};

export type AppId =
  | "telefone"
  | "mensagens"
  | "relogio"
  | "calculadora"
  | "notas"
  | "calendario"
  | "jogo"
  | "config";

export const APPS: Record<AppId, { name: string; emoji: string; color: string; component: ComponentType<AppProps> }> = {
  telefone: { name: "Telefone", emoji: "📞", color: "#16a34a", component: Telefone },
  mensagens: { name: "Mensagens", emoji: "💬", color: "#2563eb", component: Mensagens },
  relogio: { name: "Relógio", emoji: "⏰", color: "#475569", component: Relogio },
  calculadora: { name: "Calculadora", emoji: "🧮", color: "#ea580c", component: Calculadora },
  notas: { name: "Notas", emoji: "📝", color: "#eab308", component: Notas },
  calendario: { name: "Calendário", emoji: "📅", color: "#dc2626", component: Calendario },
  jogo: { name: "Jogo da Velha", emoji: "🎮", color: "#9333ea", component: Jogo },
  config: { name: "Ajustes", emoji: "⚙️", color: "#6b7280", component: Config },
};
