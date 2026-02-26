"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("pyroscope_api_key", apiKey.trim());
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-fire-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-fire-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fire-500 to-ember-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Pyro<span className="text-fire-500">Scope</span>
            </h1>
          </div>
          <p className="text-xl text-gray-400 mb-2">Fire & Smoke Detection API</p>
          <p className="text-gray-500">Upload images or stream drone feeds — get real-time fire and smoke detections with bounding boxes, confidence scores, and GPS-tagged alerts.</p>
        </div>

        {/* API Key Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter API key (optional for demo)..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-5 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-fire-500 focus:ring-1 focus:ring-fire-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-fire-600 to-fire-500 hover:from-fire-500 hover:to-fire-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-fire-500/20 hover:shadow-fire-500/40"
          >
            Open Dashboard →
          </button>
          <p className="text-sm text-gray-600">
            No key? You can still explore the dashboard in demo mode.
          </p>
        </form>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-fire-400">~42ms</div>
            <div className="text-sm text-gray-500">Inference Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-fire-400">85.3%</div>
            <div className="text-sm text-gray-500">mAP50</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-fire-400">YOLO11</div>
            <div className="text-sm text-gray-500">Model</div>
          </div>
        </div>
      </div>
    </div>
  );
}
