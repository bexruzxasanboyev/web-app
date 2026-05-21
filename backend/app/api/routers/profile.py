"""Profil endpoint'lari."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import (
    ProfileOut,
    RecentLessonOut,
    ReferredFriendOut,
    UserOut,
)
from app.core.database import get_session
from app.models.engagement import LessonView, Referral
from app.models.lesson import Lesson
from app.models.user import User
from app.services.referral import build_referral_link

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
async def get_profile(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    recent_count = (
        await session.execute(
            select(func.count(LessonView.id)).where(
                LessonView.user_id == user.id
            )
        )
    ).scalar_one()
    referral_count = (
        await session.execute(
            select(func.count(Referral.id)).where(
                Referral.referrer_id == user.id
            )
        )
    ).scalar_one()
    return ProfileOut(
        user=UserOut.model_validate(user),
        recent_count=int(recent_count),
        referral_count=int(referral_count),
        referral_link=build_referral_link(user.telegram_id),
    )


@router.get("/recent", response_model=list[RecentLessonOut])
async def get_recent(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[RecentLessonOut]:
    rows = (
        await session.execute(
            select(Lesson, LessonView.viewed_at)
            .join(LessonView, LessonView.lesson_id == Lesson.id)
            .where(LessonView.user_id == user.id)
            .order_by(LessonView.viewed_at.desc())
            .limit(50)
        )
    ).all()
    return [
        RecentLessonOut(
            id=lesson.id,
            section_id=lesson.section_id,
            title=lesson.title,
            image_url=lesson.image_url,
            viewed_at=viewed_at,
        )
        for lesson, viewed_at in rows
    ]


@router.get("/referrals", response_model=list[ReferredFriendOut])
async def get_referrals(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ReferredFriendOut]:
    rows = (
        await session.execute(
            select(User, Referral.created_at)
            .join(Referral, Referral.referred_id == User.id)
            .where(Referral.referrer_id == user.id)
            .order_by(Referral.created_at.desc())
        )
    ).all()
    return [
        ReferredFriendOut(
            first_name=friend.first_name,
            username=friend.username,
            created_at=created_at,
        )
        for friend, created_at in rows
    ]
