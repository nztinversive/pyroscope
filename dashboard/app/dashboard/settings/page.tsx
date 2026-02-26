"use client";
import { useState, useEffect } from "react";
import { useApiKey } from "../../lib/hooks";

export default function SettingsPage() {
  const { key, setKey, clearKey } = useApiKey();
  const [keyInput, setKeyInput] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookThreshold, setWebhookThreshold] = useState("0.5");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeyInput(key);
    setWebhookUrl(localStorage.getItem("pyroscope_webhook_url") || "");
    setWebhookThreshold(localStorage.getItem("pyroscope_webhook_threshold") || "0.5");
  }, [key]);

  const saveApiKey = () => {
    setKey(keyInput);
    flash();
  };

  const saveWebhook = () => {
    localStorage.setItem("pyroscope_webhook_url", webhookUrl);
    localStorage.setItem("pyroscope_webhook_threshold", webhookThreshold);
    flash();
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-2 rounded-lg text-sm">
          ✓ Saved
        </div>
      )}

      {/* API Key */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">API Key</h2>
        <p className="text-sm text-gray-500">Your API key is stored locally and sent with each request.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="pyro_sk_..."
            className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-fire-500"
          />
          <button
            onClick={saveApiKey}
            className="px-4 py-2.5 bg-fire-600 hover:bg-fire-500 rounded-lg text-white text-sm font-medium transition"
          >
            Save
          </button>
          {key && (
            <button
              onClick={clearKey}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Webhook */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Webhook Alerts</h2>
        <p className="text-sm text-gray-500">
          Configure a webhook URL to receive POST notifications when fire or smoke is detected above the confidence threshold.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-fire-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confidence Threshold</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={webhookThreshold}
                onChange={(e) => setWebhookThreshold(e.target.value)}
                className="flex-1 accent-fire-500"
              />
              <span className="text-fire-400 font-mono text-sm w-12 text-right">
                {(parseFloat(webhookThreshold) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <button
            onClick={saveWebhook}
            className="px-4 py-2.5 bg-fire-600 hover:bg-fire-500 rounded-lg text-white text-sm font-medium transition"
          >
            Save Webhook Config
          </button>
        </div>
      </section>

      {/* Info */}
      <section className="space-y-2 text-sm text-gray-500 border-t border-gray-800 pt-6">
        <p>API URL: <code className="text-gray-400">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code></p>
        <p>Model: PyroScope v1 (YOLO11s)</p>
        <p>Dashboard version: 0.1.0</p>
      </section>
    </div>
  );
}
