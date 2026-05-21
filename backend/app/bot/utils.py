"""Bot uchun yordamchi funksiyalar."""
from aiogram.types import User as TgUser
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User


async def get_or_create_user(session: AsyncSession, tg_user: TgUser) -> User:
    """Foydalanuvchini bazadan oladi yoki yangisini yaratadi."""
    result = await session.execute(
        select(User).where(User.telegram_id == tg_user.id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            telegram_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
            last_name=tg_user.last_name,
            language_code=tg_user.language_code,
            is_admin=tg_user.id in settings.admin_ids,
        )
        session.add(user)
        await session.commit()
    return user
