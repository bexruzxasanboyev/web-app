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
    bot_username: str = "salesaireportdilraboisraolivabot"
    webapp_url: str = "http://localhost:5173"
    support_url: str = "https://t.me/salesaireportdilraboisraolivabot"
    menu_button_text: str = "Sotuv va Audit"

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

    # minds.abdulvahob-blog.uz — tashqi to'lov/obuna backend'i
    minds_api_url: str = "https://minds.abdulvahob-blog.uz"
    minds_username: str = ""
    minds_password: str = ""


settings = Settings()  # type: ignore[call-arg]
