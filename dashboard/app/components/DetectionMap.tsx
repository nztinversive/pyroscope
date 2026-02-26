"use client";
import { useEffect, useRef } from "react";
import { DetectionResult } from "../lib/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function DetectionMap({ detections }: { detections: DetectionResult[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const loadMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-97.7431, 30.2672],
        zoom: 4,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;
    };

    loadMap();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    document.querySelectorAll(".pyro-marker").forEach((el) => el.remove());

    const loadMapbox = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const bounds = new mapboxgl.LngLatBounds();
      let hasPoints = false;

      for (const det of detections) {
        const lat = det.metadata?.lat;
        const lng = det.metadata?.lng;
        if (lat == null || lng == null) continue;

        hasPoints = true;
        const color = det.has_fire && det.has_smoke ? "#fb923c" : det.has_fire ? "#ef4444" : "#9ca3af";

        const el = document.createElement("div");
        el.className = "pyro-marker";
        el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;cursor:pointer;box-shadow:0 0 8px ${color}80`;

        const popup = new mapboxgl.Popup({ offset: 10 }).setHTML(`
          <div style="font-size:12px">
            <div style="font-weight:600;margin-bottom:4px">${det.has_fire ? "🔥 Fire" : ""}${det.has_fire && det.has_smoke ? " + " : ""}${det.has_smoke ? "💨 Smoke" : ""}</div>
            <div>Confidence: ${det.detections.map(d => `${d.class} ${(d.confidence*100).toFixed(0)}%`).join(", ")}</div>
            <div style="color:#9ca3af;margin-top:2px">${new Date(det.timestamp).toLocaleString()}</div>
            <div style="color:#6b7280">${det.inference_ms}ms</div>
          </div>
        `);

        new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        bounds.extend([lng, lat]);
      }

      if (hasPoints) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    };

    loadMapbox();
  }, [detections]);

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-800" />
  );
}
