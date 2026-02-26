# 🔥 PyroScope

Fire & smoke detection API + drone integration dashboard.

Upload an image or stream drone frames → get back real-time fire/smoke detections with bounding boxes, confidence scores, and GPS-tagged alerts.

## API

```bash
# Detect fire/smoke in an image
curl -X POST http://localhost:8000/api/v1/detect \
  -H "X-API-Key: YOUR_KEY" \
  -F "file=@wildfire.jpg"

# Detect from URL (with GPS metadata)
curl -X POST http://localhost:8000/api/v1/detect/url \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/frame.jpg", "metadata": {"lat": 30.27, "lng": -97.74}}'

# Get annotated image with bounding boxes
curl -X POST http://localhost:8000/api/v1/detect/annotated \
  -H "X-API-Key: YOUR_KEY" \
  -F "file=@wildfire.jpg" -o annotated.jpg
```

## Model

- YOLO11s trained on DBA-Fire dataset (3,905 images)
- Classes: `fire`, `smoke`
- mAP50: 0.853 | Fire: 0.760 | Smoke: 0.946
- ~42ms inference on RTX 3060

## Stack

- **API**: FastAPI + Ultralytics YOLO + CUDA
- **Dashboard**: Next.js 14 + Mapbox GL JS
- **Model**: Available on [Replicate](https://replicate.com/nztinversive/pyroscope)

## Quick Start

```bash
# API
cd pyroscope
pip install -r requirements.txt
# Place model weights at api/models/best.pt
uvicorn api.main:app --host 0.0.0.0 --port 8000

# Dashboard
cd dashboard
npm install && npm run dev
```

## API Docs

Run the API and visit `/docs` for interactive Swagger docs.
