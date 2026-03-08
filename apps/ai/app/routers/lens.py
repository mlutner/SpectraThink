"""Lens application router — Sprint 3-4 implementation."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/apply")
async def apply_lens():
    """Apply a thinking lens to an entry. Sprint 3."""
    return {"error": {"code": "NOT_IMPLEMENTED", "message": "Lenses available in Sprint 3"}}
