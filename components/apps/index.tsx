"use client";
import type { ComponentType } from "react";
import type { IconName } from "../Icon";
import type { Sys } from "../sys";
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
import Gravador from "./Gravador";
import Mapas from "./Mapas";

export type AppProps = {
  sys: Sys;
  setSys: (s: Sys) => void;
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
  | "gravador"
  | "mapas"
  | "config";

type AppDef = {
  name: string;
  icon: IconName;
  grad: string; // fundo do ícone
  bg: string; // fundo da janela durante a animação
  dark: boolean; // true = texto da barra de status fica branco
  component: ComponentType<AppProps>;
};

const ICON_BG = "linear-gradient(145deg,#4b4b50,#1b1b1e)";

export const APPS: Record<AppId, AppDef> = {
  telefone: { name: "Telefone", icon: "phone", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Telefone },
  mensagens: { name: "Mensagens", icon: "message", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Mensagens },
  contatos: { name: "Contatos", icon: "user", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Contatos },
  camera: { name: "Câmera", icon: "camera", grad: ICON_BG, bg: "#000", dark: true, component: Camera },
  galeria: { name: "Galeria", icon: "image", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Galeria },
  navegador: { name: "Navegador", icon: "globe", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Navegador },
  relogio: { name: "Relógio", icon: "clock", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Relogio },
  calculadora: { name: "Calculadora", icon: "calculator", grad: ICON_BG, bg: "#000", dark: true, component: Calculadora },
  calendario: { name: "Calendário", icon: "calendar", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Calendario },
  notas: { name: "Notas", icon: "note", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Notas },
  clima: { name: "Clima", icon: "cloud", grad: ICON_BG, bg: "#1e3a8a", dark: true, component: Clima },
  mapas: { name: "Mapas", icon: "map", grad: ICON_BG, bg: "#e8eaed", dark: false, component: Mapas },
  gravador: { name: "Gravador", icon: "mic", grad: ICON_BG, bg: "#0b0b0d", dark: true, component: Gravador },
  config: { name: "Ajustes", icon: "sliders", grad: ICON_BG, bg: "#f6f7fb", dark: false, component: Config },
};
