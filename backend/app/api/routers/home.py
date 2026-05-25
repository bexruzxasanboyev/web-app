"""Bosh sahifa endpoint'i — bannerlar va bo'limlar."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import fetch_minds_user, get_current_user
from app.api.schemas import BannerOut, HomeOut, SectionOut, SubscriptionOut
from app.core.database import get_session
from app.models.banner import Banner
from app.models.lesson import Lesson
from app.models.section import Section
from app.models.user import User
from app.services.minds import is_subscription_active, parse_deadline
from app.services.referral import build_referral_link

router = APIRouter(tags=["home"])


@router.get("/home", response_model=HomeOut)
async def get_home(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> HomeOut:
    banners = (
        await session.execute(
            select(Banner)
            .where(Banner.is_active.is_(True))
            .order_by(Banner.position)
        )
    ).scalars().all()

    # Har bir bo'limdagi darsliklar soni
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

    sections = [
        SectionOut(
            id=section.id,
            title=section.title,
            image_url=section.image_url,
            lesson_count=int(count),
        )
        for section, count in rows
    ]

    minds_user = await fetch_minds_user(user.telegram_id)
    deadline_raw = minds_user.get("deadline") if isinstance(minds_user, dict) else None
    deadline = parse_deadline(deadline_raw)
    subscription = SubscriptionOut(
        is_active=is_subscription_active(deadline_raw) or user.is_admin,
        deadline=deadline.isoformat() if deadline else None,
    )

    return HomeOut(
        banners=[BannerOut.model_validate(b) for b in banners],
        sections=sections,
        section_count=len(sections),
        referral_link=build_referral_link(user.telegram_id),
        subscription=subscription,
    )
