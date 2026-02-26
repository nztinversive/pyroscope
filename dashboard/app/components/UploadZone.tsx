"use client";
import { useState, useRef, useCallback } from "react";
import { detect, DetectionResult } from "../lib/api";

export default function UploadZone({ onResult }: { onResult?: (r: DetectionResult, file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const result = await detect(file);
      onResult?.(result, file);
    } catch (e: any) {
      setError(e.message || "Detection failed");
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragging ? "border-fire-500 bg-fire-500/10" : "border-gray-700 hover:border-gray-500"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-fire-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Analyzing...</span>
        </div>
      ) : (
        <>
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-gray-400 text-sm">Drop an image or click to upload</p>
          <p className="text-gray-600 text-xs mt-1">JPG, PNG — fire/smoke detection in ~42ms</p>
        </>
      )}
      {error && <p className="text-ember-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
