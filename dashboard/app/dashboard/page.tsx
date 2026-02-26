"use client";
import { useState, useEffect, useCallback } from "react";
import { getDetections, DetectionResult } from "../lib/api";
import DetectionMap from "../components/DetectionMap";
import StatsBar from "../components/StatsBar";
import UploadZone from "../components/UploadZone";
import DetectionOverlay from "../components/DetectionOverlay";

export default function DashboardPage() {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [lastResult, setLastResult] = useState<{ result: DetectionResult; url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDetections({ limit: 100 })
      .then(setDetections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResult = useCallback((result: DetectionResult, file: File) => {
    const url = URL.createObjectURL(file);
    setLastResult({ result, url });
    setDetections((prev) => [result, ...prev]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detection Dashboard</h1>
        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : `${detections.length} detections`}
        </div>
      </div>

      <StatsBar detections={detections} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DetectionMap detections={detections} />
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Detect</h2>
          <UploadZone onResult={handleResult} />
          {lastResult && (
            <DetectionOverlay result={lastResult.result} imageUrl={lastResult.url} />
          )}
        </div>
      </div>
    </div>
  );
}
