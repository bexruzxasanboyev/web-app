"""Loyiha sozlamalari — .env faylidan o'qiladi."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Telegram
    bot_token: str
    bot_username: str = "prisma_uz_bot"
    webapp_url: str = "http://localhost:5173"
    support_url: str = "https://t.me/prisma_uz_bot"
    menu_button_text: str = "Prisma"

    # Ma'lumotlar bazasi (postgresql+asyncpg://...)
    database_url: str

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list[str] = ["*"]

    # Adminlar
    admin_ids: list[int] = []

    # Test rejimi: Telegram'siz (brauzerda) ham ishlashga ruxsat beradi —
    # initData bo'lmasa standart "Test Admin" foydalanuvchi ishlatiladi.
    # Loyiha to'liq ishga tushganda False qiling.
    dev_auth_bypass: bool = False


settings = Settings()  # type: ignore[call-arg]
