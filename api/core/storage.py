"""Simple JSON-based detection storage for MVP."""
import json
import time
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"
DETECTIONS_FILE = DATA_DIR / "detections.json"

_detections: list[dict] = []
_loaded = False


def _load():
    global _detections, _loaded
    if _loaded:
        return
    DATA_DIR.mkdir(exist_ok=True)
    if DETECTIONS_FILE.exists():
        _detections = json.loads(DETECTIONS_FILE.read_text())
    _loaded = True


def _save():
    DATA_DIR.mkdir(exist_ok=True)
    # Keep last 10000 detections
    DETECTIONS_FILE.write_text(json.dumps(_detections[-10000:], indent=2))


def save_detection(det_id: str, result: dict):
    _load()
    _detections.append(result)
    # Async-safe enough for MVP (single process)
    if len(_detections) % 10 == 0:
        _save()


def list_detections(
    source: Optional[str] = None,
    has_fire: Optional[bool] = None,
    has_smoke: Optional[bool] = None,
    since: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    _load()
    results = _detections[:]
    
    if has_fire is not None:
        results = [d for d in results if d.get("has_fire") == has_fire]
    if has_smoke is not None:
        results = [d for d in results if d.get("has_smoke") == has_smoke]
    if source:
        results = [d for d in results if d.get("metadata", {}).get("source") == source]
    
    # Most recent first
    results.reverse()
    return results[:limit]


def get_detection(det_id: str) -> Optional[dict]:
    _load()
    for d in reversed(_detections):
        if d.get("id") == det_id:
            return d
    return None
