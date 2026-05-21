"""Saqlangan darsliklar endpoint'i."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import LessonCardOut
from app.core.database import get_session
from app.models.engagement import SavedLesson
from app.models.lesson import Lesson
from app.models.user import User

router = APIRouter(prefix="/saved", tags=["saved"])


@router.get("", response_model=list[LessonCardOut])
async def list_saved(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[LessonCardOut]:
    lessons = (
        await session.execute(
            select(Lesson)
            .join(SavedLesson, SavedLesson.lesson_id == Lesson.id)
            .where(SavedLesson.user_id == user.id)
            .order_by(SavedLesson.created_at.desc())
        )
    ).scalars().all()
    return [LessonCardOut.model_validate(le) for le in lessons]
