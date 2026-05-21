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


async def get_init_data(authorization: str = Header(default="")) -> dict:
    """`Authorization: tma <initData>` sarlavhasini tekshiradi."""
    scheme, _, init_data = authorization.partition(" ")
    if scheme.lower() != "tma" or not init_data:
        logger.warning("initData rad etildi: Authorization sarlavhasi yo'q")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ilova faqat Telegram orqali ochilishi kerak",
        )
    try:
        return validate_init_data(init_data, settings.bot_token)
    except InitDataError as exc:
        logger.warning("initData rad etildi: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


async def get_current_user(
    init_data: dict = Depends(get_init_data),
    session: AsyncSession = Depends(get_session),
) -> User:
    """initData'dagi foydalanuvchini bazadan oladi yoki yaratadi."""
    tg_user = init_data.get("user")
    if not tg_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="initData ichida foydalanuvchi ma'lumoti yo'q",
        )

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
            is_admin=tg_user["id"] in settings.admin_ids,
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
