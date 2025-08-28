// lib/antiPiracy.js
// NOTE: Web par 100% piracy stop karna possible nahi hota,
// ye strong deterrents hain jo normal copying/screen-record ko mushkil banate hain.

function preventDefault(e) {
  e.preventDefault?.();
  e.stopPropagation?.();
  return false;
}

function keyBlocker(e) {
  const k = e.key?.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;

  // Devtools/Save/Print/View-source/Select-all/Copy/Paste, etc.
  if (
    k === "f12" ||
    (ctrl && ["s","p","u","c","x","v","a"].includes(k)) ||
    (ctrl && e.shiftKey && ["i","j","c"].includes(k))
  ) return preventDefault(e);

  // PrintScreen (best-effort)
  if (k === "printscreen") return preventDefault(e);
}

function contextBlocker(e){ return preventDefault(e); }
function dragBlocker(e){ return preventDefault(e); }
function copyCutPasteBlocker(e){ return preventDefault(e); }

function addGlobalStyles() {
  const css = `
  /* Selection off on protected elements */
  [data-protect="true"], [data-protect="true"] * {
    -webkit-user-select: none; -moz-user-select: none; user-select: none;
  }
  /* Hide PiP button on supported browsers */
  video[data-protect="true"]::-internal-media-controls-download-button { display:none; }
  video[data-protect="true"] { pointer-events: auto; }
  /* Watermark grid */
  .wm-grid { position:absolute; inset:0; pointer-events:none; opacity:.25;
    display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:1fr; gap:0; }
  .wm-tile { display:flex; align-items:center; justify-content:center;
    font-size:2.4vw; font-weight:700; transform:rotate(-20deg); white-space:nowrap; }
  @media (max-width: 768px) { .wm-tile { font-size:4vw; } }
  `;
  const id = "anti-piracy-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id; style.innerHTML = css;
    document.head.appendChild(style);
  }
}

export function mountAntiPiracy({ root = document, watermarkText = "" } = {}) {
  if (typeof window === "undefined") return () => {};

  addGlobalStyles();

  // Global listeners
  root.addEventListener("contextmenu", contextBlocker, { capture:true });
  root.addEventListener("dragstart", dragBlocker, { capture:true });
  root.addEventListener("keydown", keyBlocker, { capture:true });
  root.addEventListener("copy", copyCutPasteBlocker, { capture:true });
  root.addEventListener("cut", copyCutPasteBlocker, { capture:true });
  root.addEventListener("paste", copyCutPasteBlocker, { capture:true });

  // Auto-pause if tab hidden (screen recording often hides tab)
  const onVis = () => {
    if (document.hidden) {
      root.querySelectorAll('video[data-protect="true"]').forEach(v => v.pause?.());
    }
  };
  document.addEventListener("visibilitychange", onVis, { capture:true });

  // Return cleanup
  return () => {
    root.removeEventListener("contextmenu", contextBlocker, { capture:true });
    root.removeEventListener("dragstart", dragBlocker, { capture:true });
    root.removeEventListener("keydown", keyBlocker, { capture:true });
    root.removeEventListener("copy", copyCutPasteBlocker, { capture:true });
    root.removeEventListener("cut", copyCutPasteBlocker, { capture:true });
    root.removeEventListener("paste", copyCutPasteBlocker, { capture:true });
    document.removeEventListener("visibilitychange", onVis, { capture:true });
  };
}

// Utility to render a watermark grid inside a container
export function renderWatermark(container, text = "") {
  if (!container || typeof window === "undefined") return;
  if (container.querySelector(".wm-grid")) return; // already mounted

  const grid = document.createElement("div");
  grid.className = "wm-grid";
  for (let i = 0; i < 16; i++) {
    const d = document.createElement("div");
    d.className = "wm-tile";
    d.textContent = text;
    grid.appendChild(d);
  }
  container.appendChild(grid);
}
