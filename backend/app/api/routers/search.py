"""Qidiruv endpoint'i."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import LessonCardOut
from app.core.database import get_session
from app.models.lesson import Lesson
from app.models.user import User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[LessonCardOut])
async def search_lessons(
    q: str = Query(default="", min_length=0),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[LessonCardOut]:
    query = q.strip()
    if len(query) < 2:
        return []
    lessons = (
        await session.execute(
            select(Lesson)
            .where(Lesson.title.ilike(f"%{query}%"))
            .order_by(Lesson.position)
            .limit(50)
        )
    ).scalars().all()
    return [LessonCardOut.model_validate(le) for le in lessons]
