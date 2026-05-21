"""Bot klaviaturalari."""
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)

from app.bot import texts
from app.core.config import settings


def main_reply_kb() -> ReplyKeyboardMarkup:
    """Asosiy doimiy klaviatura (2x2)."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text=texts.BTN_OPEN_APP),
                KeyboardButton(text=texts.BTN_NOTIFICATIONS),
            ],
            [
                KeyboardButton(text=texts.BTN_SUPPORT),
                KeyboardButton(text=texts.BTN_ABOUT),
            ],
        ],
        resize_keyboard=True,
    )


def open_app_kb() -> InlineKeyboardMarkup:
    """Mini app'ni ochuvchi inline tugma."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=texts.BTN_OPEN_APP,
                    web_app=WebAppInfo(url=settings.webapp_url),
                )
            ]
        ]
    )


def notifications_kb(enabled: bool) -> InlineKeyboardMarkup:
    """Bildirishnomani yoqish/o'chirish tugmasi."""
    label = texts.BTN_NOTIF_OFF if enabled else texts.BTN_NOTIF_ON
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=label, callback_data="toggle_notifications")]
        ]
    )


def support_kb() -> InlineKeyboardMarkup:
    """Qo'llab-quvvatlashga murojaat qilish tugmasi."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=texts.BTN_CONTACT, url=settings.support_url)]
        ]
    )
