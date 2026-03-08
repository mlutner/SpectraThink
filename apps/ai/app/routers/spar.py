"""Spar adversarial dialogue router — Sprint 3 implementation."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/start")
async def start_session():
    """Start a Spar session. Sprint 3."""
    return {"error": {"code": "NOT_IMPLEMENTED", "message": "Spar available in Sprint 3"}}


@router.post("/turn")
async def submit_turn():
    """Submit a Spar turn. Sprint 3."""
    return {"error": {"code": "NOT_IMPLEMENTED", "message": "Spar available in Sprint 3"}}
