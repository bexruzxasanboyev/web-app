"""FastAPI dependency'lari — autentifikatsiya va foydalanuvchi."""
import logging
import time

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.security import InitDataError, validate_init_data
from app.models.user import User
from app.services.minds import MindsError, is_subscription_active, minds

logger = logging.getLogger(__name__)

# minds /users/one javobi bir necha so'rovda qayta-qayta kerak bo'ladi
# (status, lessons, saved...). Foydalanuvchilarni 30 soniya in-memory kesh
# qilamiz — bu minds'ga yuklamani sezilarli kamaytiradi.
_USER_CACHE: dict[int, tuple[float, dict | None]] = {}
_USER_CACHE_TTL = 30.0  # soniya


async def fetch_minds_user(telegram_id: int) -> dict | None:
    """minds'dan foydalanuvchini oladi (qisqa keshli)."""
    now = time.time()
    cached = _USER_CACHE.get(telegram_id)
    if cached and now - cached[0] < _USER_CACHE_TTL:
        return cached[1]
    try:
        data = await minds.get_user(telegram_id, raise_on_missing=False)
    except MindsError as exc:
        logger.warning("minds users/one xatosi (%s): %s", telegram_id, exc)
        return None
    _USER_CACHE[telegram_id] = (now, data)
    return data


def invalidate_minds_user(telegram_id: int) -> None:
    """To'lov muvaffaqiyatli o'tgandan keyin keshni tozalash uchun."""
    _USER_CACHE.pop(telegram_id, None)

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
        # initData yo'q yoki yaroqsiz bo'lsa — test user bilan davom etamiz
        # (Telegram-only bloki olib tashlandi)
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


async def require_subscription(user: User = Depends(get_current_user)) -> User:
    """Faol obunasi bo'lmagan foydalanuvchi uchun 402 qaytaradi.

    Adminlar to'lovsiz ham hammasiga kira oladi.
    """
    if user.is_admin:
        return user
    minds_user = await fetch_minds_user(user.telegram_id)
    deadline_raw = minds_user.get("deadline") if isinstance(minds_user, dict) else None
    if not is_subscription_active(deadline_raw):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Obuna talab qilinadi",
        )
    return user
