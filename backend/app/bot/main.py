"""Telegram bot kirish nuqtasi (polling rejimida ishlaydi)."""
import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from app.bot.handlers import menu, start
from app.bot.middlewares.db import DbSessionMiddleware
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def on_startup(bot: Bot) -> None:
    """Bot ishga tushganda buyruqlar va menyu tugmasini o'rnatadi."""
    await bot.set_my_commands(
        [BotCommand(command="start", description="Botni ishga tushirish")]
    )
    # Menyu tugmasidagi web_app faqat HTTPS bilan ishlaydi
    if settings.webapp_url.startswith("https://"):
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text=settings.menu_button_text,
                web_app=WebAppInfo(url=settings.webapp_url),
            )
        )
        logger.info("Menyu tugmasi o'rnatildi")
    else:
        logger.warning(
            "WEBAPP_URL HTTPS emas — menyu tugmasi o'rnatilmadi (dev rejim)"
        )


async def main() -> None:
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()

    # Har bir update uchun DB sessiyasini inject qiladi
    dp.update.middleware(DbSessionMiddleware())

    # Handler router'lari
    dp.include_router(start.router)
    dp.include_router(menu.router)

    dp.startup.register(on_startup)

    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Bot ishga tushdi (polling)")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
