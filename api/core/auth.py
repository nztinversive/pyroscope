"""API key authentication and usage tracking."""
import json
import secrets
import time
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from .config import API_KEYS_FILE, DETECTIONS_FILE

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# In-memory stores (persisted to JSON)
_api_keys: dict = {}  # key -> {name, tier, created_at, requests, last_used}
_usage: dict = {}  # key -> [{timestamp, endpoint}]


def _load_keys():
    global _api_keys
    if API_KEYS_FILE.exists():
        _api_keys = json.loads(API_KEYS_FILE.read_text())
    elif not _api_keys:
        # Create a default demo key
        demo_key = create_key("demo", "free")
        print(f"[PyroScope] Demo API key created: {demo_key}")


def _save_keys():
    API_KEYS_FILE.parent.mkdir(exist_ok=True)
    API_KEYS_FILE.write_text(json.dumps(_api_keys, indent=2))


def create_key(name: str, tier: str = "free") -> str:
    """Create a new API key."""
    key = f"pyro_sk_{secrets.token_hex(24)}"
    _api_keys[key] = {
        "name": name,
        "tier": tier,
        "created_at": time.time(),
        "requests": 0,
        "last_used": None,
    }
    _save_keys()
    return key


def revoke_key(key: str) -> bool:
    """Revoke an API key."""
    if key in _api_keys:
        del _api_keys[key]
        _save_keys()
        return True
    return False


def list_keys() -> list[dict]:
    """List all API keys (masked)."""
    _load_keys()
    return [
        {
            "key": f"{k[:12]}...{k[-4:]}",
            "full_key": k,
            "name": v["name"],
            "tier": v["tier"],
            "requests": v["requests"],
            "last_used": v["last_used"],
        }
        for k, v in _api_keys.items()
    ]


def validate_key(key: Optional[str]) -> dict:
    """Validate an API key and return its info."""
    _load_keys()
    if not key or key not in _api_keys:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    info = _api_keys[key]
    info["requests"] += 1
    info["last_used"] = time.time()
    _save_keys()
    return info


async def get_api_key(api_key: Optional[str] = Security(api_key_header)) -> dict:
    """FastAPI dependency for API key validation."""
    return validate_key(api_key)


def get_usage(key: str) -> dict:
    """Get usage stats for a key."""
    _load_keys()
    if key not in _api_keys:
        raise HTTPException(status_code=404, detail="Key not found")
    info = _api_keys[key]
    return {
        "key": f"{key[:12]}...{key[-4:]}",
        "name": info["name"],
        "tier": info["tier"],
        "total_requests": info["requests"],
        "created_at": info["created_at"],
        "last_used": info["last_used"],
    }
