"use client";
import { useRef, useEffect, useState } from "react";
import { DetectionResult } from "../lib/api";

const CLASS_COLORS: Record<string, string> = {
  fire: "#ef4444",
  smoke: "#9ca3af",
};

export default function DetectionOverlay({
  result,
  imageUrl,
}: {
  result: DetectionResult;
  imageUrl: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = canvas.parentElement?.clientWidth || 640;
      const scale = Math.min(1, maxW / img.width);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.width = w;
      canvas.height = h;
      setDims({ w, h });

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      for (const det of result.detections) {
        const [x1n, y1n, x2n, y2n] = det.bbox_normalized;
        const x = x1n * w, y = y1n * h;
        const bw = (x2n - x1n) * w, bh = (y2n - y1n) * h;
        const color = CLASS_COLORS[det.class] || "#fb923c";

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, bw, bh);

        const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 12px Inter, sans-serif";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 18, tw + 8, 18);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, x + 4, y - 5);
      }
    };
    img.src = imageUrl;
  }, [result, imageUrl]);

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 inline-block">
      <canvas ref={canvasRef} className="max-w-full" />
      <div className="px-3 py-2 flex items-center gap-4 text-xs text-gray-400">
        <span>{result.detections.length} detection{result.detections.length !== 1 ? "s" : ""}</span>
        <span>{result.inference_ms}ms</span>
        {result.has_fire && <span className="text-ember-400">🔥 Fire</span>}
        {result.has_smoke && <span className="text-smoke-400">💨 Smoke</span>}
      </div>
    </div>
  );
}
