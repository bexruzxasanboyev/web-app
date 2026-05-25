"""/start buyrug'i — taklif (referral) havolasini ham qo'llab-quvvatlaydi."""
import logging

from aiogram import Router
from aiogram.filters import CommandObject, CommandStart
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot import texts
from app.bot.keyboards import main_reply_kb, open_app_kb
from app.bot.utils import get_or_create_user
from app.services.minds import MindsError, minds
from app.services.referral import create_referral

logger = logging.getLogger(__name__)

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(
    message: Message,
    command: CommandObject,
    session: AsyncSession,
) -> None:
    if message.from_user is None:
        return
    user = await get_or_create_user(session, message.from_user)

    # Taklif havolasi orqali kelgan bo'lsa: /start ref_<telegram_id>
    if command.args and command.args.startswith("ref_"):
        try:
            referrer_id = int(command.args[4:])
        except ValueError:
            referrer_id = None
        if referrer_id:
            await create_referral(session, referrer_id, user)

    # Foydalanuvchini minds to'lov tizimida ham ro'yxatdan o'tkazamiz
    # (idempotent — mavjud bo'lsa qaytmaydi). Xato bo'lsa botni to'xtatmaymiz.
    if minds.enabled:
        full_name = " ".join(
            p for p in (user.first_name or "", user.last_name or "") if p
        ).strip()
        try:
            await minds.ensure_user(user.telegram_id, name=full_name)
        except MindsError as exc:
            logger.warning("minds ensure_user xatosi (%s): %s", user.telegram_id, exc)

    # 1) Salomlashish + doimiy reply klaviatura
    await message.answer(
        texts.start_text(message.from_user.first_name or "do'stim"),
        reply_markup=main_reply_kb(),
    )
    # 2) Birinchi marta kelganlar uchun darhol "Ilovani ochish" inline tugmasi
    await message.answer(texts.OPEN_APP_TEXT, reply_markup=open_app_kb())
