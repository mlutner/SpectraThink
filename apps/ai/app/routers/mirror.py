"""Mirror analysis router — Sprint 2 implementation."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/analyze")
async def analyze_entry():
    """Generate Mirror analysis for an entry. Sprint 2."""
    return {"error": {"code": "NOT_IMPLEMENTED", "message": "Mirror analysis available in Sprint 2"}}
