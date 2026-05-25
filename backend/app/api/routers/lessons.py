"""Darslik endpoint'lari — ko'rish, saqlash."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_subscription
from app.api.schemas import LessonDetailOut, SavedToggleOut
from app.core.database import get_session
from app.models.engagement import LessonView, SavedLesson
from app.models.lesson import Lesson
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["lessons"])


async def _get_lesson_or_404(session: AsyncSession, lesson_id: int) -> Lesson:
    lesson = await session.get(
        Lesson, lesson_id, options=[selectinload(Lesson.section)]
    )
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Darslik topilmadi"
        )
    return lesson


@router.get("/{lesson_id}", response_model=LessonDetailOut)
async def get_lesson(
    lesson_id: int,
    user: User = Depends(require_subscription),
    session: AsyncSession = Depends(get_session),
) -> LessonDetailOut:
    lesson = await _get_lesson_or_404(session, lesson_id)

    # Ko'rishni yozib qo'yish (har user/lesson uchun bitta yozuv)
    view = (
        await session.execute(
            select(LessonView).where(
                LessonView.user_id == user.id,
                LessonView.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()
    if view is None:
        session.add(LessonView(user_id=user.id, lesson_id=lesson_id))
    else:
        view.viewed_at = datetime.now(timezone.utc)

    # Saqlanganmi?
    saved = (
        await session.execute(
            select(SavedLesson).where(
                SavedLesson.user_id == user.id,
                SavedLesson.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()

    await session.commit()

    return LessonDetailOut(
        id=lesson.id,
        section_id=lesson.section_id,
        section_title=lesson.section.title if lesson.section else None,
        title=lesson.title,
        image_url=lesson.image_url,
        body=lesson.body,
        warning=lesson.warning,
        video_url=lesson.video_url,
        cta_label=lesson.cta_label,
        cta_url=lesson.cta_url,
        is_new=lesson.is_new,
        published_at=lesson.published_at,
        is_saved=saved is not None,
    )


@router.post("/{lesson_id}/save", response_model=SavedToggleOut)
async def save_lesson(
    lesson_id: int,
    user: User = Depends(require_subscription),
    session: AsyncSession = Depends(get_session),
) -> SavedToggleOut:
    await _get_lesson_or_404(session, lesson_id)
    existing = (
        await session.execute(
            select(SavedLesson).where(
                SavedLesson.user_id == user.id,
                SavedLesson.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()
    if existing is None:
        session.add(SavedLesson(user_id=user.id, lesson_id=lesson_id))
        await session.commit()
    return SavedToggleOut(is_saved=True)


@router.delete("/{lesson_id}/save", response_model=SavedToggleOut)
async def unsave_lesson(
    lesson_id: int,
    user: User = Depends(require_subscription),
    session: AsyncSession = Depends(get_session),
) -> SavedToggleOut:
    await session.execute(
        delete(SavedLesson).where(
            SavedLesson.user_id == user.id,
            SavedLesson.lesson_id == lesson_id,
        )
    )
    await session.commit()
    return SavedToggleOut(is_saved=False)
