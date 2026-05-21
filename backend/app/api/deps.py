"""FastAPI dependency'lari — autentifikatsiya va foydalanuvchi."""
import logging

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.security import InitDataError, validate_init_data
from app.models.user import User

logger = logging.getLogger(__name__)

# Test/dev rejimi uchun standart "admin" foydalanuvchi
_TEST_USER = {
    "id": 1,
    "first_name": "Test",
    "last_name": "Admin",
    "username": "test_admin",
    "language_code": "uz",
}


def _extract_tg_user(authorization: str) -> dict | None:
    """`Authorization: tma <initData>` dan Telegram foydalanuvchisini ajratadi.

    Sarlavha yo'q yoki yaroqsiz bo'lsa None qaytaradi (xato ko'tarmaydi).
    """
    scheme, _, init_data = authorization.partition(" ")
    if scheme.lower() != "tma" or not init_data:
        return None
    try:
        parsed = validate_init_data(init_data, settings.bot_token)
    except InitDataError as exc:
        logger.warning("initData rad etildi: %s", exc)
        return None
    return parsed.get("user")


async def get_current_user(
    authorization: str = Header(default=""),
    session: AsyncSession = Depends(get_session),
) -> User:
    """Joriy foydalanuvchini aniqlaydi (kerak bo'lsa bazada yaratadi)."""
    tg_user = _extract_tg_user(authorization)
    is_test = False

    if tg_user is None:
        if not settings.dev_auth_bypass:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ilova faqat Telegram orqali ochilishi kerak",
            )
        # Test rejimi — standart admin bilan ishlaymiz
        tg_user = _TEST_USER
        is_test = True

    result = await session.execute(
        select(User).where(User.telegram_id == tg_user["id"])
    )
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            telegram_id=tg_user["id"],
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            language_code=tg_user.get("language_code"),
            is_admin=is_test or (tg_user["id"] in settings.admin_ids),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Foydalanuvchi bloklangan",
        )
    return user
