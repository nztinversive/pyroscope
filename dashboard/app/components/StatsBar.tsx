"use client";
import { DetectionResult } from "../lib/api";

export default function StatsBar({ detections = [] }: { detections: DetectionResult[] }) {
  const safeDetections = Array.isArray(detections) ? detections : [];
  const total = safeDetections.length;
  const fires = safeDetections.filter((d) => d.has_fire).length;
  const smokes = safeDetections.filter((d) => d.has_smoke).length;
  const avgMs = total ? Math.round(safeDetections.reduce((s, d) => s + d.inference_ms, 0) / total) : 0;

  const stats = [
    { label: "Total Detections", value: total, color: "text-fire-400" },
    { label: "Fire Alerts", value: fires, color: "text-ember-400" },
    { label: "Smoke Alerts", value: smokes, color: "text-smoke-400" },
    { label: "Avg Inference", value: `${avgMs}ms`, color: "text-gray-300" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
