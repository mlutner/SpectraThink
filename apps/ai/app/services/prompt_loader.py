"""Load prompt templates from the Node API / database.

ADR-005: Prompts are versioned in DB and hot-swappable.
The AI server fetches them from the Node API (which owns Prisma).
Caches for 5 minutes to avoid per-request DB calls.
"""

import time

import httpx

from app.config import settings

_cache: dict[str, dict] = {}
_cache_ts: dict[str, float] = {}
CACHE_TTL = 300  # 5 minutes


async def get_prompt(name: str) -> dict:
    """Fetch a prompt template by name, with caching."""
    now = time.time()

    if name in _cache and (now - _cache_ts.get(name, 0)) < CACHE_TTL:
        return _cache[name]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.node_service_url}/api/prompts/{name}",
            timeout=10.0,
        )

    if resp.status_code != 200:
        raise ValueError(f"Prompt '{name}' not found (status {resp.status_code})")

    data = resp.json()
    template = data.get("data", data)

    _cache[name] = template
    _cache_ts[name] = now

    return template


def invalidate_cache(name: str | None = None) -> None:
    """Clear prompt cache (single key or all)."""
    if name:
        _cache.pop(name, None)
        _cache_ts.pop(name, None)
    else:
        _cache.clear()
        _cache_ts.clear()
