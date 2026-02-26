"use client";
import { useState, useEffect } from "react";
import { getDetections, DetectionResult } from "../../lib/api";

type SortKey = "timestamp" | "confidence" | "class";

export default function HistoryPage() {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getDetections({ limit: 200 })
      .then(setDetections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...detections].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "timestamp") return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sortKey === "confidence") {
      const ac = Math.max(...a.detections.map((d) => d.confidence), 0);
      const bc = Math.max(...b.detections.map((d) => d.confidence), 0);
      return dir * (ac - bc);
    }
    return 0;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className={`ml-1 ${active ? "text-fire-400" : "text-gray-600"}`}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Detection History</h1>

      {loading ? (
        <div className="text-gray-500">Loading detections...</div>
      ) : detections.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No detections yet</p>
          <p className="text-sm mt-1">Upload an image on the dashboard to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3 cursor-pointer select-none" onClick={() => toggleSort("timestamp")}>
                  Time <SortIcon active={sortKey === "timestamp"} asc={sortAsc} />
                </th>
                <th className="text-left py-3 px-3">Type</th>
                <th className="text-left py-3 px-3 cursor-pointer select-none" onClick={() => toggleSort("confidence")}>
                  Confidence <SortIcon active={sortKey === "confidence"} asc={sortAsc} />
                </th>
                <th className="text-left py-3 px-3">Detections</th>
                <th className="text-left py-3 px-3">Inference</th>
                <th className="text-left py-3 px-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((det) => (
                <tr key={det.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition">
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{det.id.slice(0, 12)}</td>
                  <td className="py-3 px-3 text-gray-300">{new Date(det.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {det.has_fire && <span className="px-2 py-0.5 rounded-full text-xs bg-ember-600/20 text-ember-400">🔥 Fire</span>}
                      {det.has_smoke && <span className="px-2 py-0.5 rounded-full text-xs bg-smoke-600/20 text-smoke-400">💨 Smoke</span>}
                      {!det.has_fire && !det.has_smoke && <span className="text-gray-600 text-xs">Clear</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {det.detections.length > 0 ? (
                      <span className="text-gray-300">{(Math.max(...det.detections.map(d => d.confidence)) * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-400">{det.detections.length}</td>
                  <td className="py-3 px-3 text-gray-400">{det.inference_ms}ms</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{det.metadata?.source || "upload"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
