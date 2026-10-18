"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import type { AppProps } from "./index";

type Place = { id: string; name: string; sub: string; lat: number; lon: number };
type Mode = "car" | "foot" | "bike";
type Route = { mode: Mode; dist: number; dur: number };

const DEFAULT_CENTER: [number, number] = [-22.9068, -43.1729];
const LEAFLET = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
const CATS = [
  { label: "Restaurantes", q: "restaurante" },
  { label: "Cafés", q: "café" },
  { label: "Mercados", q: "supermercado" },
  { label: "Farmácias", q: "farmácia" },
  { label: "Postos", q: "posto de gasolina" },
  { label: "Hotéis", q: "hotel" },
];
const MODES: { id: Mode; label: string; server: string }[] = [
  { id: "car", label: "Carro", server: "routed-car" },
  { id: "foot", label: "A pé", server: "routed-foot" },
  { id: "bike", label: "Bicicleta", server: "routed-bike" },
];

let leafletP: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletP) return leafletP;
  leafletP = new Promise((res, rej) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = LEAFLET + "leaflet.min.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = LEAFLET + "leaflet.min.js";
    s.onload = () => res(w.L);
    s.onerror = () => {
      leafletP = null;
      rej(new Error("leaflet"));
    };
    document.body.appendChild(s);
  });
  return leafletP;
}

const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
const fmtDur = (s: number) => {
  const m = Math.max(1, Math.round(s / 60));
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
};

function toPlace(r: any): Place {
  const parts = String(r.display_name || "").split(",");
  return {
    id: String(r.place_id),
    name: r.name || parts[0] || "Local",
    sub: parts.slice(1, 4).join(",").trim(),
    lat: +r.lat,
    lon: +r.lon,
  };
}

export default function Mapas({ sys }: AppProps) {
  const dark = sys.dark;
  const online = sys.wifi;

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const meRef = useRef<{ lat: number; lon: number } | null>(null);
  const meMarker = useRef<any>(null);
  const meCircle = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const resRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const watchRef = useRef<number | null>(null);
  const reqId = useRef(0);
  const skipFor = useRef("");
  const act = useRef<any>({});

  const [ready, setReady] = useState(false);
  const [layer, setLayer] = useState<"std" | "sat">("std");
  const [query, setQuery] = useState("");
  const [suggest, setSuggest] = useState<Place[]>([]);
  const [cat, setCat] = useState<{ label: string; items: Place[] } | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [routing, setRouting] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3200);
  };

  /* ---------- chamadas de rede ---------- */
  const nominatim = async (q: string, bounded: boolean): Promise<Place[]> => {
    const p = new URLSearchParams({ q, format: "jsonv2", limit: bounded ? "12" : "6", "accept-language": "pt-BR" });
    const map = mapRef.current;
    if (map) {
      const b = map.getBounds();
      p.set("viewbox", `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`);
      if (bounded) p.set("bounded", "1");
    }
    const r = await fetch("https://nominatim.openstreetmap.org/search?" + p.toString());
    return ((await r.json()) as any[]).map(toPlace);
  };

  const reverse = async (lat: number, lon: number): Promise<Place> => {
    try {
      const p = new URLSearchParams({ lat: String(lat), lon: String(lon), format: "jsonv2", zoom: "18", "accept-language": "pt-BR" });
      const r = await (await fetch("https://nominatim.openstreetmap.org/reverse?" + p.toString())).json();
      const pl = toPlace({ ...r, lat, lon });
      return pl;
    } catch {
      return { id: "pin", name: "Local marcado", sub: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon };
    }
  };

  /* ---------- mapa: marcadores ---------- */
  const clearRoute = () => {
    routeRef.current?.clearLayers();
    setRoute(null);
  };

  const select = (pl: Place, fly = true) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    pinRef.current?.remove();
    pinRef.current = L.marker([pl.lat, pl.lon], {
      icon: L.divIcon({ className: "", html: '<div class="mpin"><i></i></div>', iconSize: [30, 40], iconAnchor: [15, 38] }),
    }).addTo(map);
    clearRoute();
    setSelected(pl);
    setSuggest([]);
    skipFor.current = pl.name;
    setQuery(pl.name);
    if (fly) map.flyTo([pl.lat, pl.lon], Math.max(map.getZoom(), 16), { duration: 0.8 });
  };

  const dropPin = async (lat: number, lon: number) => {
    setSuggest([]);
    select({ id: "pin", name: "Local marcado", sub: "Buscando endereço…", lat, lon }, false);
    const pl = await reverse(lat, lon);
    select(pl, false);
  };

  const closeSelected = () => {
    pinRef.current?.remove();
    pinRef.current = null;
    clearRoute();
    setSelected(null);
  };

  const showCategory = async (label: string, q: string) => {
    if (!online) return flash("Sem conexão com a internet");
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    closeSelected();
    setSuggest([]);
    try {
      const items = await nominatim(q, true);
      resRef.current?.clearLayers();
      if (!items.length) {
        setCat(null);
        return flash("Nada encontrado nesta área. Afaste o mapa e tente de novo.");
      }
      items.forEach((it) => {
        L.marker([it.lat, it.lon], {
          icon: L.divIcon({ className: "", html: '<div class="mpin sm"><i></i></div>', iconSize: [22, 30], iconAnchor: [11, 28] }),
        })
          .on("click", () => act.current.select(it))
          .addTo(resRef.current);
      });
      setCat({ label, items });
      map.fitBounds(L.latLngBounds(items.map((i) => [i.lat, i.lon])), { paddingTopLeft: [30, 140], paddingBottomRight: [30, 260], maxZoom: 17 });
    } catch {
      flash("Não foi possível pesquisar agora.");
    }
  };

  const closeCategory = () => {
    resRef.current?.clearLayers();
    setCat(null);
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    if (!online) return flash("Sem conexão com a internet");
    try {
      const items = await nominatim(q, false);
      if (!items.length) return flash("Nenhum resultado para essa busca.");
      if (items.length === 1) select(items[0]);
      else setSuggest(items);
    } catch {
      flash("Não foi possível pesquisar agora.");
    }
  };

  /* ---------- localização ---------- */
  const goMe = () => {
    const map = mapRef.current;
    if (meRef.current && map) {
      map.flyTo([meRef.current.lat, meRef.current.lon], 16, { duration: 0.8 });
    } else {
      flash("Permita a localização no navegador para ver onde você está.");
      startWatch();
    }
  };

  const startWatch = () => {
    if (watchRef.current !== null || !navigator.geolocation) return;
    let first = true;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const L = LRef.current;
        const map = mapRef.current;
        if (!L || !map) return;
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        meRef.current = { lat, lon };
        if (!meMarker.current) {
          meMarker.current = L.marker([lat, lon], {
            interactive: false,
            zIndexOffset: 500,
            icon: L.divIcon({ className: "", html: '<div class="medot"><b></b><i></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] }),
          }).addTo(map);
          meCircle.current = L.circle([lat, lon], { radius: accuracy, color: "#2563eb", weight: 1, fillColor: "#2563eb", fillOpacity: 0.12, interactive: false }).addTo(map);
        } else {
          meMarker.current.setLatLng([lat, lon]);
          meCircle.current.setLatLng([lat, lon]).setRadius(accuracy);
        }
        if (first) {
          first = false;
          map.flyTo([lat, lon], 16, { duration: 1.2 });
        }
      },
      () => {
        watchRef.current = null;
        flash("Não consegui pegar sua localização. Permita o acesso e toque no botão de localização.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  /* ---------- rotas ---------- */
  const getRoute = async (mode: Mode) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!selected || !L || !map) return;
    if (!online) return flash("Sem conexão com a internet");
    if (!meRef.current) {
      flash("Preciso da sua localização para traçar a rota.");
      return startWatch();
    }
    setRouting(true);
    try {
      const a = meRef.current;
      const server = MODES.find((m) => m.id === mode)!.server;
      const url = `https://routing.openstreetmap.de/${server}/route/v1/driving/${a.lon},${a.lat};${selected.lon},${selected.lat}?overview=full&geometries=geojson`;
      const data = await (await fetch(url)).json();
      const r = data.routes?.[0];
      if (!r) throw new Error("no route");
      routeRef.current.clearLayers();
      const latlngs = r.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      L.polyline(latlngs, { color: "#fff", weight: 9, opacity: 0.9, lineCap: "round" }).addTo(routeRef.current);
      L.polyline(latlngs, { color: "#2563eb", weight: 5.5, lineCap: "round" }).addTo(routeRef.current);
      map.fitBounds(L.latLngBounds(latlngs), { paddingTopLeft: [40, 140], paddingBottomRight: [40, 250] });
      setRoute({ mode, dist: r.distance, dur: r.duration });
    } catch {
      flash("Não encontrei rota para esse destino.");
    }
    setRouting(false);
  };

  act.current = { select, dropPin };

  /* ---------- inicialização ---------- */
  useEffect(() => {
    let dead = false;
    loadLeaflet()
      .then((L) => {
        if (dead || !mapEl.current) return;
        const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false, center: DEFAULT_CENTER, zoom: 13 });
        L.control.attribution({ prefix: false, position: "bottomleft" }).addTo(map);
        LRef.current = L;
        mapRef.current = map;
        resRef.current = L.layerGroup().addTo(map);
        routeRef.current = L.layerGroup().addTo(map);
        map.on("click", (e: any) => act.current.dropPin(e.latlng.lat, e.latlng.lng));
        [200, 600, 1200].forEach((t) => setTimeout(() => !dead && map.invalidateSize(), t));
        setReady(true);
        startWatch();
      })
      .catch(() => flash("Não consegui carregar o mapa. Verifique sua internet."));
    return () => {
      dead = true;
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      meMarker.current = null;
      meCircle.current = null;
      pinRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* camada de tiles: segue o tema e o modo satélite */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    tileRef.current?.remove();
    let url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attr = "© OpenStreetMap";
    if (layer === "sat") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Imagens © Esri";
    } else if (dark) {
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attr = "© OpenStreetMap © CARTO";
    }
    tileRef.current = L.tileLayer(url, { attribution: attr, maxZoom: 19, subdomains: "abc" }).addTo(map);
    tileRef.current.bringToBack();
  }, [ready, dark, layer]);

  /* sugestões enquanto digita */
  useEffect(() => {
    if (skipFor.current === query) return;
    skipFor.current = "";
    const q = query.trim();
    if (q.length < 3 || !online || !ready) {
      setSuggest([]);
      return;
    }
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const r = await nominatim(q, false);
        if (id === reqId.current) setSuggest(r);
      } catch {}
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, online, ready]);

  const clearAll = () => {
    skipFor.current = "";
    setQuery("");
    setSuggest([]);
    closeSelected();
    closeCategory();
  };

  const zoom = (d: number) => mapRef.current?.setZoom(mapRef.current.getZoom() + d);

  return (
    <div className={"app maps" + (dark ? " mdark" : "")}>
      <div className="maps-map" ref={mapEl} />

      {!online && (
        <div className="maps-off">
          <Icon name="wifi" size={34} />
          <b>Sem conexão</b>
          <small>Ligue o Wi-Fi nos Ajustes para usar o Mapas.</small>
        </div>
      )}

      <div className="maps-top">
        <form
          className="maps-search"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <Icon name="search" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar no Mapas" />
          {query && (
            <button type="button" aria-label="Limpar" onClick={clearAll}>
              <Icon name="x" size={18} />
            </button>
          )}
        </form>

        {suggest.length > 0 ? (
          <div className="maps-drop">
            {suggest.map((p) => (
              <button key={p.id} onClick={() => select(p)}>
                <span className="maps-dot">
                  <Icon name="map" size={15} />
                </span>
                <span>
                  <b>{p.name}</b>
                  <small>{p.sub}</small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="maps-chips">
            {CATS.map((c) => (
              <button key={c.label} className={cat?.label === c.label ? "on" : ""} onClick={() => showCategory(c.label, c.q)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="maps-side">
        <button aria-label="Aproximar" onClick={() => zoom(1)}>
          <Icon name="plus" size={20} />
        </button>
        <button aria-label="Afastar" onClick={() => zoom(-1)}>
          <Icon name="minus" size={20} />
        </button>
        <button aria-label="Tipo de mapa" className={layer === "sat" ? "on" : ""} onClick={() => setLayer(layer === "std" ? "sat" : "std")}>
          <Icon name="layers" size={20} />
        </button>
        <button aria-label="Minha localização" onClick={goMe}>
          <Icon name="locate" size={20} />
        </button>
      </div>

      {selected ? (
        <div className="maps-sheet">
          <div className="maps-sheet-h">
            <div>
              <b>{selected.name}</b>
              <small>{selected.sub}</small>
            </div>
            <button aria-label="Fechar" onClick={closeSelected}>
              <Icon name="x" size={18} />
            </button>
          </div>
          {route ? (
            <>
              <div className="maps-modes">
                {MODES.map((m) => (
                  <button key={m.id} className={route.mode === m.id ? "on" : ""} onClick={() => getRoute(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="maps-eta">
                <span className="t">{fmtDur(route.dur)}</span>
                <span className="d">{fmtDist(route.dist)}</span>
              </div>
              <button className="maps-go end" onClick={clearRoute}>
                Encerrar rota
              </button>
            </>
          ) : (
            <button className="maps-go" disabled={routing} onClick={() => getRoute("car")}>
              <Icon name="navigate" size={17} fill="currentColor" stroke={0} /> {routing ? "Calculando…" : "Rotas"}
            </button>
          )}
        </div>
      ) : (
        cat && (
          <div className="maps-sheet list">
            <div className="maps-sheet-h">
              <div>
                <b>{cat.label} por perto</b>
                <small>{cat.items.length} resultados nesta área</small>
              </div>
              <button aria-label="Fechar" onClick={closeCategory}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="maps-results">
              {cat.items.map((p) => (
                <button key={p.id} onClick={() => select(p)}>
                  <b>{p.name}</b>
                  <small>{p.sub}</small>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {msg && <div className="maps-toast">{msg}</div>}
    </div>
  );
}
