"""minds.abdulvahob-blog.uz — tashqi to'lov/obuna backend'i bilan ishlovchi client.

Bizning backend admin sifatida minds'ga kiradi (OAuth2 password) va har bir
foydalanuvchi nomidan so'rov yuboradi. Token ichki keshda saqlanadi.

Mini app foydalanuvchini "Telegram ID = minds user_id" tamoyili bo'yicha
identifikatsiya qiladi: yangi foydalanuvchi /start bosganida bot uni minds'da
ham ro'yxatdan o'tkazadi (`ensure_user`), keyin barcha to'lov so'rovlari
shu user_id bilan ketadi.
"""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import date, datetime
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Token sukut bo'yicha 30 daqiqaga eskirgan deb hisoblanadi (haqiqiy TTL
# minds tomonidan beriladi — kerak bo'lsa shu yerdan ko'paytiramiz).
_DEFAULT_TOKEN_TTL = 25 * 60
_HTTP_TIMEOUT = httpx.Timeout(15.0, connect=5.0)


class MindsError(Exception):
    """minds API qaytargan xatolik."""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class MindsClient:
    def __init__(self) -> None:
        self._token: str | None = None
        self._token_exp: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def enabled(self) -> bool:
        return bool(settings.minds_username and settings.minds_password)

    # ---- ichki yordamchilar ----

    async def _login(self) -> str:
        if not self.enabled:
            raise MindsError("minds kreditallari sozlanmagan (.env: MINDS_USERNAME/PASSWORD)")
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.minds_api_url}/token",
                data={
                    "username": settings.minds_username,
                    "password": settings.minds_password,
                    "grant_type": "password",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        if resp.status_code != 200:
            logger.warning("minds /token rad etdi: %s %s", resp.status_code, resp.text)
            raise MindsError("minds login muvaffaqiyatsiz", resp.status_code)
        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise MindsError("minds /token javobida access_token yo'q")
        self._token = token
        self._token_exp = time.time() + _DEFAULT_TOKEN_TTL
        logger.info("minds token yangilandi")
        return token

    async def _get_token(self) -> str:
        async with self._lock:
            if self._token and time.time() < self._token_exp:
                return self._token
            return await self._login()

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any | None = None,
        retry_on_401: bool = True,
    ) -> httpx.Response:
        token = await self._get_token()
        url = f"{settings.minds_api_url}{path}"
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            resp = await client.request(method, url, params=params, json=json, headers=headers)
        if resp.status_code == 401 and retry_on_401:
            # token eskirgan bo'lishi mumkin — bir marta yangilab qayta urinamiz
            self._token = None
            return await self._request(
                method, path, params=params, json=json, retry_on_401=False
            )
        return resp

    @staticmethod
    def _json_or_error(resp: httpx.Response, context: str) -> Any:
        if resp.status_code >= 400:
            try:
                detail = resp.json().get("detail", resp.text)
            except Exception:  # noqa: BLE001
                detail = resp.text
            logger.warning("minds %s xatosi (%s): %s", context, resp.status_code, detail)
            raise MindsError(f"{context}: {detail}", resp.status_code)
        if resp.status_code == 204 or not resp.content:
            return None
        try:
            return resp.json()
        except ValueError as exc:
            raise MindsError(f"{context}: javob JSON emas") from exc

    # ---- ommaviy metodlar ----

    async def ensure_user(
        self,
        user_id: int,
        name: str = "",
        phone: str = "",
    ) -> dict[str, Any]:
        """Foydalanuvchini minds'da yaratadi (yoki mavjud bo'lsa qaytaradi)."""
        existing = await self.get_user(user_id, raise_on_missing=False)
        if existing is not None:
            return existing
        payload: dict[str, Any] = {"user_id": user_id, "name": name or "", "phone": phone or ""}
        resp = await self._request("POST", "/users/add", json=payload)
        # 200/201 — yaratildi; 400/409 — allaqachon mavjud (parallel so'rov yoki
        # oldin yaratilgan). Har ikkala holda ham keyin get_user bilan
        # tasdiqlaymiz; haqiqiy xato (500+) bo'lsa, qayta o'qishda chiqadi.
        if resp.status_code >= 500:
            self._json_or_error(resp, "users/add")
        again = await self.get_user(user_id, raise_on_missing=False)
        if again is not None:
            return again
        # bu yerga yetib kelganimiz — yaratish ham, o'qish ham ishlamadi
        self._json_or_error(resp, "users/add")
        return {"user_id": user_id}

    async def get_user(
        self, user_id: int, *, raise_on_missing: bool = True
    ) -> dict[str, Any] | None:
        resp = await self._request("GET", "/users/one", params={"user_id": user_id})
        if resp.status_code == 200:
            try:
                return resp.json()
            except ValueError as exc:
                raise MindsError("users/one: javob JSON emas") from exc
        # minds foydalanuvchi yo'q bo'lganda 404 yoki 400 ("Bunday id raqamli
        # malumot mavjud emas") qaytaradi — ikkala holatni ham "yo'q" deb
        # qabul qilamiz.
        if resp.status_code in (400, 404):
            if raise_on_missing:
                raise MindsError("foydalanuvchi minds'da topilmadi", resp.status_code)
            return None
        return self._json_or_error(resp, "users/one")

    async def list_months(self, user_id: int) -> list[dict[str, Any]]:
        resp = await self._request("GET", "/months/", params={"user_id": user_id})
        data = self._json_or_error(resp, "months/")
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data["items"]
        return []

    async def add_card(
        self,
        *,
        user_id: int,
        month: int,
        card_number: str,
        expiry_year: str,
        expiry_month: str,
    ) -> dict[str, Any]:
        """Karta qo'shadi — minds SMS kod yuboradi va transaction_id qaytaradi."""
        payload = {
            "user_id": user_id,
            "month": month,
            "card_number": card_number,
            "expiry_year": expiry_year,
            "expiry_month": expiry_month,
        }
        resp = await self._request("POST", "/cards/add", json=payload)
        return self._json_or_error(resp, "cards/add") or {}

    async def confirm_card(
        self,
        *,
        user_id: int,
        month: int,
        transaction_id: int,
        code: str,
    ) -> dict[str, Any]:
        payload = {
            "user_id": user_id,
            "month": month,
            "transaction_id": transaction_id,
            "code": code,
        }
        resp = await self._request("POST", "/cards/confirm", json=payload)
        return self._json_or_error(resp, "cards/confirm") or {}


# Yagona global instance — har joydan import qilinadi.
minds = MindsClient()


# ---- sodda yordamchilar (foydalanuvchi obunasi muddatini tekshirish) ----

def parse_deadline(raw: Any) -> date | None:
    """minds qaytargan deadline ni `date` ga o'giradi (turli formatlarni qabul qiladi)."""
    if not raw:
        return None
    if isinstance(raw, date) and not isinstance(raw, datetime):
        return raw
    if isinstance(raw, datetime):
        return raw.date()
    if isinstance(raw, str):
        try:
            return date.fromisoformat(raw[:10])
        except ValueError:
            return None
    return None


def is_subscription_active(deadline_raw: Any, today: date | None = None) -> bool:
    deadline = parse_deadline(deadline_raw)
    if deadline is None:
        return False
    today = today or date.today()
    return deadline >= today
