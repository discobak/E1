"use client";
import type { ComponentType } from "react";
import type { IconName } from "../Icon";
import Telefone from "./Telefone";
import Mensagens from "./Mensagens";
import Contatos from "./Contatos";
import Camera from "./Camera";
import Galeria from "./Galeria";
import Navegador from "./Navegador";
import Relogio from "./Relogio";
import Calculadora from "./Calculadora";
import Calendario from "./Calendario";
import Notas from "./Notas";
import Clima from "./Clima";
import Config from "./Config";

export type AppProps = {
  wall: number;
  setWall: (n: number) => void;
  brightness: number;
  setBrightness: (n: number) => void;
};

export type AppId =
  | "telefone"
  | "mensagens"
  | "contatos"
  | "camera"
  | "galeria"
  | "navegador"
  | "relogio"
  | "calculadora"
  | "calendario"
  | "notas"
  | "clima"
  | "config";

type AppDef = {
  name: string;
  icon: IconName;
  grad: string; // fundo do ícone
  bg: string; // fundo da janela durante a animação
  dark: boolean; // true = texto da barra de status fica branco
  component: ComponentType<AppProps>;
};

export const APPS: Record<AppId, AppDef> = {
  telefone: { name: "Telefone", icon: "phone", grad: "linear-gradient(145deg,#4ade80,#16a34a)", bg: "#f6f7fb", dark: false, component: Telefone },
  mensagens: { name: "Mensagens", icon: "message", grad: "linear-gradient(145deg,#60a5fa,#2563eb)", bg: "#f6f7fb", dark: false, component: Mensagens },
  contatos: { name: "Contatos", icon: "user", grad: "linear-gradient(145deg,#fb923c,#ea580c)", bg: "#f6f7fb", dark: false, component: Contatos },
  camera: { name: "Câmera", icon: "camera", grad: "linear-gradient(145deg,#52525b,#18181b)", bg: "#000", dark: true, component: Camera },
  galeria: { name: "Galeria", icon: "image", grad: "linear-gradient(145deg,#f472b6,#a855f7)", bg: "#f6f7fb", dark: false, component: Galeria },
  navegador: { name: "Navegador", icon: "globe", grad: "linear-gradient(145deg,#38bdf8,#0369a1)", bg: "#f6f7fb", dark: false, component: Navegador },
  relogio: { name: "Relógio", icon: "clock", grad: "linear-gradient(145deg,#64748b,#1e293b)", bg: "#f6f7fb", dark: false, component: Relogio },
  calculadora: { name: "Calculadora", icon: "calculator", grad: "linear-gradient(145deg,#fbbf24,#ea580c)", bg: "#000", dark: true, component: Calculadora },
  calendario: { name: "Calendário", icon: "calendar", grad: "linear-gradient(145deg,#f87171,#dc2626)", bg: "#f6f7fb", dark: false, component: Calendario },
  notas: { name: "Notas", icon: "note", grad: "linear-gradient(145deg,#fde047,#eab308)", bg: "#f6f7fb", dark: false, component: Notas },
  clima: { name: "Clima", icon: "cloud", grad: "linear-gradient(145deg,#38bdf8,#6366f1)", bg: "#1e3a8a", dark: true, component: Clima },
  config: { name: "Ajustes", icon: "sliders", grad: "linear-gradient(145deg,#9ca3af,#4b5563)", bg: "#f6f7fb", dark: false, component: Config },
};
