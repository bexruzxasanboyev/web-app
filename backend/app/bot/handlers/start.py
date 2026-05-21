"""/start buyrug'i — taklif (referral) havolasini ham qo'llab-quvvatlaydi."""
from aiogram import Router
from aiogram.filters import CommandObject, CommandStart
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot import texts
from app.bot.keyboards import main_reply_kb
from app.bot.utils import get_or_create_user
from app.services.referral import create_referral

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

    await message.answer(
        texts.start_text(message.from_user.first_name or "do'stim"),
        reply_markup=main_reply_kb(),
    )
