"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { useStored } from "../hooks";
import { KEYS, SAMPLES, Photo } from "../data";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useStored<Photo[]>(KEYS.photos, SAMPLES);

  useEffect(() => {
    let cancelled = false;
    setErr("");
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("sem suporte");
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setErr("Não foi possível acessar a câmera. Permita o acesso no navegador (o site precisa estar em HTTPS).");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [facing]);

  // desliga a câmera ao fechar o app
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const sc = Math.min(1, 640 / v.videoWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * sc);
    c.height = Math.round(v.videoHeight * sc);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const src = c.toDataURL("image/jpeg", 0.7);
    setPhotos((p) => [{ id: String(Date.now()), src, time: Date.now() }, ...p].slice(0, 30));
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const last = photos[0];

  return (
    <div className="app cam">
      <video ref={videoRef} playsInline muted className={facing === "user" ? "mirror" : ""} />
      {err && <div className="cam-err">{err}</div>}
      {flash && <div className="cam-flash" />}
      <div className="cam-mode">FOTO</div>
      <div className="cam-bar">
        <span className="thumb">{last && <img src={last.src} alt="Última foto" />}</span>
        <button className="shutter" aria-label="Tirar foto" onClick={shoot}>
          <i />
        </button>
        <button className="flipbtn" aria-label="Virar câmera" onClick={() => setFacing(facing === "user" ? "environment" : "user")}>
          <Icon name="flip" size={24} />
        </button>
      </div>
    </div>
  );
}
