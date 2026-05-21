"""FastAPI ilovasi — mini app uchun backend API."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    faq,
    home,
    lessons,
    profile,
    saved,
    search,
    sections,
    users,
)
from app.core.config import settings

app = FastAPI(title="Prisma Mini App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    home.router,
    sections.router,
    lessons.router,
    faq.router,
    saved.router,
    search.router,
    profile.router,
    users.router,
):
    app.include_router(router, prefix="/api")


@app.get("/api/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
