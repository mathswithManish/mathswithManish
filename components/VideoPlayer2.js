// components/VideoPlayer.js
import { useEffect, useRef } from "react";

// ---- Anti-piracy helpers INLINE (no external import) ----
function preventDefault(e) {
  e.preventDefault?.(); e.stopPropagation?.(); return false;
}
function keyBlocker(e) {
  const k = e.key?.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (
    k === "f12" ||
    (ctrl && ["s","p","u","c","x","v","a"].includes(k)) ||
    (ctrl && e.shiftKey && ["i","j","c"].includes(k)) ||
    k === "printscreen"
  ) return preventDefault(e);
}
function addGlobalStyles() {
  const css = `
  [data-protect="true"], [data-protect="true"] * { user-select:none; -webkit-user-select:none; }
  video[data-protect="true"]::-internal-media-controls-download-button{ display:none; }
  .wm-grid{ position:absolute; inset:0; pointer-events:none; opacity:.25;
    display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:1fr; }
  .wm-tile{ display:flex; align-items:center; justify-content:center;
    font-size:2.4vw; font-weight:700; transform:rotate(-20deg); white-space:nowrap; }
  @media (max-width:768px){ .wm-tile{ font-size:4vw; } }
  `;
  if (!document.getElementById("anti-piracy-styles")) {
    const style = document.createElement("style");
    style.id = "anti-piracy-styles"; style.innerHTML = css;
    document.head.appendChild(style);
  }
}
function mountAntiPiracy({ root = document } = {}) {
  if (typeof window === "undefined") return () => {};
  addGlobalStyles();
  const handlers = [
    ["contextmenu", preventDefault],
    ["dragstart", preventDefault],
    ["keydown", keyBlocker],
    ["copy", preventDefault],
    ["cut", preventDefault],
    ["paste", preventDefault],
  ];
  handlers.forEach(([ev, fn]) => root.addEventListener(ev, fn, { capture:true }));
  const onVis = () => { if (document.hidden)
    root.querySelectorAll('video[data-protect="true"]').forEach(v => v.pause?.());
  };
  document.addEventListener("visibilitychange", onVis, { capture:true });
  return () => {
    handlers.forEach(([ev, fn]) => root.removeEventListener(ev, fn, { capture:true }));
    document.removeEventListener("visibilitychange", onVis, { capture:true });
  };
}
function renderWatermark(container, text = "") {
  if (!container || typeof window === "undefined") return;
  if (container.querySelector(".wm-grid")) return;
  const grid = document.createElement("div");
  grid.className = "wm-grid";
  for (let i = 0; i < 16; i++) {
    const d = document.createElement("div");
    d.className = "wm-tile"; d.textContent = text; grid.appendChild(d);
  }
  container.appendChild(grid);
}
// ---- helpers end ----

export default function VideoPlayer({ src, title, userLabel = "MathsWithManish" }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const cleanup = mountAntiPiracy({ root: document });
    if (wrapRef.current) renderWatermark(wrapRef.current, userLabel);

    if (videoRef.current) {
      try {
        videoRef.current.setAttribute("controlsList", "nodownload noplaybackrate");
        videoRef.current.setAttribute("disablePictureInPicture", "true");
        videoRef.current.setAttribute("playsinline", "true");
      } catch {}
      const h = (e) => e.preventDefault();
      videoRef.current.addEventListener("contextmenu", h);
      return () => { videoRef.current?.removeEventListener("contextmenu", h); cleanup?.(); };
    }
    return cleanup;
  }, [userLabel]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <video
        ref={videoRef}
        data-protect="true"
        src={src}
        title={title}
        controls
        preload="metadata"
        style={{ width: "100%", height: "auto", background: "black" }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
