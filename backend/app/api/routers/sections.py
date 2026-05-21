"""Bo'limlar endpoint'lari."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import LessonCardOut, SectionDetailOut, SectionOut
from app.core.database import get_session
from app.models.lesson import Lesson
from app.models.section import Section
from app.models.user import User

router = APIRouter(prefix="/sections", tags=["sections"])


@router.get("", response_model=list[SectionOut])
async def list_sections(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[SectionOut]:
    count_subq = (
        select(Lesson.section_id, func.count(Lesson.id).label("cnt"))
        .group_by(Lesson.section_id)
        .subquery()
    )
    rows = (
        await session.execute(
            select(Section, func.coalesce(count_subq.c.cnt, 0))
            .outerjoin(count_subq, Section.id == count_subq.c.section_id)
            .where(Section.is_active.is_(True))
            .order_by(Section.position)
        )
    ).all()
    return [
        SectionOut(
            id=s.id, title=s.title, image_url=s.image_url, lesson_count=int(c)
        )
        for s, c in rows
    ]


@router.get("/{section_id}", response_model=SectionDetailOut)
async def get_section(
    section_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SectionDetailOut:
    section = await session.get(Section, section_id)
    if section is None or not section.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bo'lim topilmadi"
        )

    lessons = (
        await session.execute(
            select(Lesson)
            .where(Lesson.section_id == section_id)
            .order_by(Lesson.position)
        )
    ).scalars().all()

    return SectionDetailOut(
        id=section.id,
        title=section.title,
        image_url=section.image_url,
        lessons=[LessonCardOut.model_validate(le) for le in lessons],
    )
