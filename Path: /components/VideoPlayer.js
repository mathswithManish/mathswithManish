// components/VideoPlayer.js
import { useEffect, useRef } from "react";
import { mountAntiPiracy, renderWatermark } from "../lib/antiPiracy";

export default function VideoPlayer({ src, title, userLabel = "MathsWithManish" }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Mount global deterrents
    const cleanup = mountAntiPiracy({ watermarkText: userLabel });

    // Watermark overlay inside wrapper
    if (wrapRef.current) renderWatermark(wrapRef.current, userLabel);

    // Extra video attributes to deter copying
    if (videoRef.current) {
      try {
        videoRef.current.setAttribute("controlsList", "nodownload noplaybackrate");
        videoRef.current.setAttribute("disablePictureInPicture", "true");
        videoRef.current.setAttribute("playsinline", "true");
      } catch {}
      // Block context menu on video
      const h = (e) => e.preventDefault();
      videoRef.current.addEventListener("contextmenu", h);
      return () => {
        videoRef.current?.removeEventListener("contextmenu", h);
        cleanup?.();
      };
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
