"""API key management endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..core.auth import get_api_key, create_key, revoke_key, list_keys, get_usage

router = APIRouter(prefix="/api/v1", tags=["keys"])


class CreateKeyRequest(BaseModel):
    name: str
    tier: str = "free"


@router.post("/keys")
async def create_api_key(body: CreateKeyRequest):
    """Create a new API key. (Admin endpoint - no auth for MVP)"""
    key = create_key(body.name, body.tier)
    return {"key": key, "name": body.name, "tier": body.tier}


@router.get("/keys")
async def list_api_keys():
    """List all API keys (masked). (Admin endpoint)"""
    return {"keys": list_keys()}


@router.delete("/keys/{key}")
async def delete_api_key(key: str):
    """Revoke an API key."""
    if revoke_key(key):
        return {"status": "revoked"}
    raise HTTPException(404, "Key not found")


@router.get("/usage")
async def get_my_usage(key_info: dict = Depends(get_api_key)):
    """Get usage stats for the current API key."""
    # Find the key from the header
    return {
        "name": key_info.get("name"),
        "tier": key_info.get("tier"),
        "total_requests": key_info.get("requests"),
        "last_used": key_info.get("last_used"),
    }
