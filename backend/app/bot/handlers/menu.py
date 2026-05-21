"""Reply klaviatura tugmalari va inline callback'lar."""
from aiogram import F, Router
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot import texts
from app.bot.keyboards import notifications_kb, open_app_kb, support_kb
from app.bot.utils import get_or_create_user

router = Router(name="menu")


@router.message(F.text == texts.BTN_OPEN_APP)
async def open_app(message: Message) -> None:
    await message.answer(texts.OPEN_APP_TEXT, reply_markup=open_app_kb())


@router.message(F.text == texts.BTN_NOTIFICATIONS)
async def show_notifications(message: Message, session: AsyncSession) -> None:
    if message.from_user is None:
        return
    user = await get_or_create_user(session, message.from_user)
    await message.answer(
        texts.notifications_text(user.notifications_enabled),
        reply_markup=notifications_kb(user.notifications_enabled),
    )


@router.callback_query(F.data == "toggle_notifications")
async def toggle_notifications(
    callback: CallbackQuery, session: AsyncSession
) -> None:
    if callback.from_user is None or not isinstance(callback.message, Message):
        await callback.answer()
        return
    user = await get_or_create_user(session, callback.from_user)
    user.notifications_enabled = not user.notifications_enabled
    await session.commit()
    await callback.message.edit_text(
        texts.notifications_text(user.notifications_enabled),
        reply_markup=notifications_kb(user.notifications_enabled),
    )
    status = "yoqildi" if user.notifications_enabled else "o'chirildi"
    await callback.answer(f"Bildirishnoma {status}")


@router.message(F.text == texts.BTN_SUPPORT)
async def show_support(message: Message) -> None:
    await message.answer(texts.SUPPORT_TEXT, reply_markup=support_kb())


@router.message(F.text == texts.BTN_ABOUT)
async def show_about(message: Message) -> None:
    await message.answer(texts.ABOUT_TEXT)
