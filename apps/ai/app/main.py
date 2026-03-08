"""
Spectra AI Service — FastAPI server for all AI operations.

Handles:
- Mirror analysis (structured thinking decomposition)
- Spar sessions (adversarial dialogue)
- Lens applications (Socratic, Inversion, Steelman)
- Embedding generation (pgvector)

Separated from Node/Express CRUD server per ADR-002.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import mirror, spar, lens, embeddings

app = FastAPI(
    title="Spectra AI Service",
    version="0.1.0",
    docs_url="/ai/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.node_service_url],
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# ─── Routers ──────────────────────────────────────────────────
app.include_router(mirror.router, prefix="/ai/mirror", tags=["mirror"])
app.include_router(spar.router, prefix="/ai/spar", tags=["spar"])
app.include_router(lens.router, prefix="/ai/lens", tags=["lens"])
app.include_router(embeddings.router, prefix="/ai/embeddings", tags=["embeddings"])


@app.get("/ai/health")
async def health():
    return {"status": "ok", "service": "spectra-ai"}
