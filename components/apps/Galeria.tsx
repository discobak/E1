"use client";
import { useState } from "react";
import Icon from "../Icon";
import { useStored } from "../hooks";
import { KEYS, SAMPLES, Photo } from "../data";

export default function Galeria() {
  const [photos, setPhotos] = useStored<Photo[]>(KEYS.photos, SAMPLES);
  const [view, setView] = useState<number | null>(null);

  if (view !== null && photos[view]) {
    const p = photos[view];
    return (
      <div className="app viewer push">
        <div className="appbar">
          <button onClick={() => setView(null)} aria-label="Voltar"><Icon name="back" size={24} /></button>
          <span className="muted">{view + 1} / {photos.length}</span>
          <button
            aria-label="Excluir foto"
            onClick={() => {
              setPhotos(photos.filter((x) => x.id !== p.id));
              setView(null);
            }}
          >
            <Icon name="trash" size={22} />
          </button>
        </div>
        <div className="viewer-stage">
          <button disabled={view === 0} onClick={() => setView(view - 1)} aria-label="Anterior"><Icon name="back" size={26} /></button>
          <img key={p.id} src={p.src} alt="Foto" />
          <button disabled={view >= photos.length - 1} onClick={() => setView(view + 1)} aria-label="Próxima"><Icon name="forward" size={26} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="app light">
      <div className="appbar">
        <h2>Galeria</h2>
        <span className="muted">{photos.length} fotos</span>
      </div>
      {photos.length === 0 && <div className="empty">Nenhuma foto. Tire fotos no app Câmera.</div>}
      <div className="photo-grid">
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setView(i)} style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
            <img src={p.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
