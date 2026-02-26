"""PyroScope configuration."""
import os
from pathlib import Path

API_VERSION = "0.1.0"
MODEL_PATH = Path(__file__).parent.parent / "models" / "best.pt"
DEFAULT_CONFIDENCE = 0.25
MAX_BATCH_SIZE = 10
MAX_IMAGE_SIZE_MB = 20

# Rate limiting
FREE_TIER_RPM = 60
PRO_TIER_RPM = 600

# API Keys (in-memory for MVP, swap to DB later)
API_KEYS_FILE = Path(__file__).parent.parent / "data" / "api_keys.json"
DETECTIONS_FILE = Path(__file__).parent.parent / "data" / "detections.json"

# Ensure data dir exists
(Path(__file__).parent.parent / "data").mkdir(exist_ok=True)
