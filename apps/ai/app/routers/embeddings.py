"""Embedding generation router — Sprint 2 implementation."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/generate")
async def generate_embedding():
    """Generate embedding for an entry. Sprint 2."""
    return {"error": {"code": "NOT_IMPLEMENTED", "message": "Embeddings available in Sprint 2"}}
