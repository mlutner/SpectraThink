"""Mirror analysis router — structured thinking decomposition."""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.mirror import analyze_entry, MirrorResult

logger = logging.getLogger(__name__)

router = APIRouter()


class MirrorRequest(BaseModel):
    entry_id: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)


class MirrorResponse(BaseModel):
    data: MirrorResult
    prompt_version: str
    entry_id: str


@router.post("/analyze", response_model=MirrorResponse)
async def analyze(req: MirrorRequest):
    """Generate Mirror analysis for an entry.

    Called by the Node API when a user triggers Mirror on their entry.
    Returns structured analysis (frame, assumptions, avoided question).
    The Node API is responsible for persisting the results.
    """
    try:
        result, prompt_version = await analyze_entry(req.content)

        return MirrorResponse(
            data=result,
            prompt_version=prompt_version,
            entry_id=req.entry_id,
        )
    except ValueError as e:
        logger.error("Mirror analysis failed: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Mirror analysis error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Mirror analysis failed")
