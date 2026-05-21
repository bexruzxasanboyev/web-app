"""Taklif (referral) tizimi xizmati."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.engagement import Referral
from app.models.user import User


def build_referral_link(telegram_id: int) -> str:
    """Foydalanuvchining shaxsiy taklif havolasini qaytaradi."""
    return f"https://t.me/{settings.bot_username}?start=ref_{telegram_id}"


async def create_referral(
    session: AsyncSession,
    referrer_telegram_id: int,
    referred_user: User,
) -> Referral | None:
    """Taklif yozuvini yaratadi (agar to'g'ri va takrorlanmagan bo'lsa)."""
    if referrer_telegram_id == referred_user.telegram_id:
        return None

    referrer = (
        await session.execute(
            select(User).where(User.telegram_id == referrer_telegram_id)
        )
    ).scalar_one_or_none()
    if referrer is None:
        return None

    already = (
        await session.execute(
            select(Referral).where(Referral.referred_id == referred_user.id)
        )
    ).scalar_one_or_none()
    if already is not None:
        return None

    referral = Referral(referrer_id=referrer.id, referred_id=referred_user.id)
    session.add(referral)
    await session.commit()
    return referral
