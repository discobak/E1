"use client";
import { useEffect, useState } from "react";
import Icon, { IconName } from "../Icon";

type Weather = {
  current: { time: string; temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

const FALLBACK = { lat: -22.9068, lon: -43.1729, label: "Rio de Janeiro" };

function describe(code: number): { text: string; icon: IconName } {
  if (code === 0) return { text: "Céu limpo", icon: "sun" };
  if (code <= 2) return { text: "Parcialmente nublado", icon: "sun" };
  if (code === 3) return { text: "Nublado", icon: "cloud" };
  if (code === 45 || code === 48) return { text: "Neblina", icon: "cloud" };
  if (code >= 51 && code <= 57) return { text: "Garoa", icon: "rain" };
  if (code >= 61 && code <= 67) return { text: "Chuva", icon: "rain" };
  if (code >= 71 && code <= 77) return { text: "Neve", icon: "cloud" };
  if (code >= 80 && code <= 82) return { text: "Pancadas de chuva", icon: "rain" };
  if (code >= 95) return { text: "Tempestade", icon: "rain" };
  return { text: "Nublado", icon: "cloud" };
}

const WEEK = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default function Clima() {
  const [data, setData] = useState<Weather | null>(null);
  const [place, setPlace] = useState(FALLBACK.label);
  const [err, setErr] = useState("");

  useEffect(() => {
    let dead = false;
    const load = async (lat: number, lon: number) => {
      try {
        const u =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&timezone=auto&forecast_days=5`;
        const r = await fetch(u);
        if (!r.ok) throw new Error();
        const j = (await r.json()) as Weather;
        if (!dead) setData(j);
      } catch {
        if (!dead) setErr("Não foi possível carregar a previsão. Verifique sua conexão.");
      }
    };
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setPlace("Sua localização");
          load(p.coords.latitude, p.coords.longitude);
        },
        () => load(FALLBACK.lat, FALLBACK.lon),
        { timeout: 4000 }
      );
    } else load(FALLBACK.lat, FALLBACK.lon);
    return () => {
      dead = true;
    };
  }, []);

  if (err) return <div className="app weather"><div className="empty light-text">{err}</div></div>;
  if (!data) return <div className="app weather"><div className="empty light-text">Carregando previsão...</div></div>;

  const cur = describe(data.current.weather_code);
  const start = Math.max(0, data.hourly.time.findIndex((t) => t >= data.current.time.slice(0, 13)));
  const hours = data.hourly.time.slice(start, start + 12).map((t, i) => ({
    h: t.slice(11, 13) + "h",
    temp: Math.round(data.hourly.temperature_2m[start + i]),
    code: data.hourly.weather_code[start + i],
  }));

  return (
    <div className="app weather">
      <div className="w-main">
        <div className="w-place">{place}</div>
        <div className="w-temp">{Math.round(data.current.temperature_2m)}°</div>
        <div className="w-desc"><Icon name={cur.icon} size={22} /> {cur.text}</div>
        <div className="w-range">
          Máx {Math.round(data.daily.temperature_2m_max[0])}° · Mín {Math.round(data.daily.temperature_2m_min[0])}°
        </div>
      </div>

      <div className="w-card">
        <div className="w-title">Próximas horas</div>
        <div className="w-hours">
          {hours.map((h, i) => (
            <div key={i}>
              <span>{i === 0 ? "Agora" : h.h}</span>
              <Icon name={describe(h.code).icon} size={20} />
              <b>{h.temp}°</b>
            </div>
          ))}
        </div>
      </div>

      <div className="w-card">
        <div className="w-title">Próximos dias</div>
        {data.daily.time.map((d, i) => (
          <div className="w-day" key={d}>
            <span>{i === 0 ? "Hoje" : WEEK[new Date(d + "T12:00:00").getDay()]}</span>
            <Icon name={describe(data.daily.weather_code[i]).icon} size={20} />
            <span className="w-min">{Math.round(data.daily.temperature_2m_min[i])}°</span>
            <span>{Math.round(data.daily.temperature_2m_max[i])}°</span>
          </div>
        ))}
      </div>

      <div className="w-stats">
        <div><small>Sensação</small><b>{Math.round(data.current.apparent_temperature)}°</b></div>
        <div><small>Umidade</small><b>{data.current.relative_humidity_2m}%</b></div>
        <div><small>Vento</small><b>{Math.round(data.current.wind_speed_10m)} km/h</b></div>
      </div>
    </div>
  );
}
