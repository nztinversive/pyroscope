const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pyroscope_api_key");
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {};
  const key = getApiKey();
  if (key) h["X-API-Key"] = key;
  return h;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  bbox_normalized: [number, number, number, number];
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  image_size: [number, number];
  detections: Detection[];
  inference_ms: number;
  model: string;
  has_fire: boolean;
  has_smoke: boolean;
  metadata?: { lat?: number; lng?: number; source?: string };
  image_url?: string;
}

export async function detect(file: File, confidence = 0.25): Promise<DetectionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/v1/detect?confidence=${confidence}`, {
    method: "POST",
    headers: headers(),
    body: form,
  });
  if (!res.ok) throw new Error(`Detection failed: ${res.status}`);
  return res.json();
}

export async function detectAnnotated(file: File, confidence = 0.25): Promise<Blob> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/v1/detect/annotated?confidence=${confidence}`, {
    method: "POST",
    headers: headers(),
    body: form,
  });
  if (!res.ok) throw new Error(`Annotated detection failed: ${res.status}`);
  return res.blob();
}

export async function getDetections(params?: {
  has_fire?: boolean;
  has_smoke?: boolean;
  limit?: number;
  since?: string;
}): Promise<DetectionResult[]> {
  const q = new URLSearchParams();
  if (params?.has_fire !== undefined) q.set("has_fire", String(params.has_fire));
  if (params?.has_smoke !== undefined) q.set("has_smoke", String(params.has_smoke));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.since) q.set("since", params.since);
  const res = await fetch(`${API_URL}/api/v1/detections?${q}`, { headers: headers() });
  if (!res.ok) throw new Error(`Failed to fetch detections: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.detections || [];
}

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/v1/health`, { headers: headers() });
  return res.json();
}

export async function getUsage() {
  const res = await fetch(`${API_URL}/api/v1/usage`, { headers: headers() });
  return res.json();
}
