"""Telegram WebApp initData imzosini tekshirish.

Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hashlib
import hmac
import json
import logging
import time
from urllib.parse import parse_qsl

logger = logging.getLogger(__name__)


class InitDataError(Exception):
    """initData yaroqsiz bo'lganda ko'tariladi."""


def validate_init_data(
    init_data: str,
    bot_token: str,
    max_age: int = 86400,
) -> dict:
    """initData ni tekshiradi va ichidagi maydonlarni qaytaradi.

    `user` maydoni avtomatik dict ga parse qilinadi.
    """
    try:
        parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    except ValueError as exc:
        raise InitDataError("initData formati noto'g'ri") from exc

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise InitDataError("initData ichida hash topilmadi")

    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()

    def _calc(fields: dict) -> str:
        check_string = "\n".join(
            f"{key}={value}" for key, value in sorted(fields.items())
        )
        return hmac.new(
            secret_key, check_string.encode(), hashlib.sha256
        ).hexdigest()

    # Telegram'ning yangi initData'sida Ed25519 'signature' maydoni bo'ladi.
    # Ba'zi mijozlarda u HMAC hash'iga kiradi, ba'zilarida yo'q —
    # ikkala variantni ham sinaymiz.
    without_signature = {k: v for k, v in parsed.items() if k != "signature"}
    candidates = {_calc(parsed), _calc(without_signature)}

    if not any(hmac.compare_digest(c, received_hash) for c in candidates):
        logger.warning("initData HMAC mos kelmadi: init_data=%r", init_data)
        raise InitDataError("initData imzosi yaroqsiz")

    auth_date = int(parsed.get("auth_date", "0") or "0")
    if max_age and auth_date and time.time() - auth_date > max_age:
        raise InitDataError("initData muddati o'tgan")

    user_raw = parsed.get("user")
    parsed["user"] = json.loads(user_raw) if user_raw else None
    return parsed
