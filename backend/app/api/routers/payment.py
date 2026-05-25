"""To'lov endpoint'lari — minds API'ga proksi.

Foydalanuvchi mini app'da:
  1) GET /payment/status      — joriy obuna + tariflar (oylar)
  2) POST /payment/card/add   — karta ma'lumotini yuboradi, SMS keladi
  3) POST /payment/card/confirm — SMS kodni tasdiqlaydi, obuna faollashadi
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import fetch_minds_user, get_current_user, invalidate_minds_user
from app.api.schemas import (
    CardAddIn,
    CardAddOut,
    CardConfirmIn,
    CardConfirmOut,
    MonthOut,
    PaymentStatusOut,
    SubscriptionOut,
)
from app.models.user import User
from app.services.minds import (
    MindsError,
    is_subscription_active,
    minds,
    parse_deadline,
)

router = APIRouter(prefix="/payment", tags=["payment"])

# minds'da boshqa adminlar tomonidan qoldirilgan test tariflar (narxi juda past)
# foydalanuvchilarga ko'rinmasligi uchun minimal qiymat filtri.
MIN_TARIFF_MONEY = 5000


def _full_name(user: User) -> str:
    parts = [user.first_name or "", user.last_name or ""]
    return " ".join(p for p in parts if p).strip()


def _build_subscription(minds_user: dict | None, is_admin: bool) -> SubscriptionOut:
    deadline_raw = minds_user.get("deadline") if isinstance(minds_user, dict) else None
    deadline = parse_deadline(deadline_raw)
    return SubscriptionOut(
        is_active=is_subscription_active(deadline_raw) or is_admin,
        deadline=deadline.isoformat() if deadline else None,
    )


def _normalize_months(raw: list[dict]) -> list[MonthOut]:
    out: list[MonthOut] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        month_id = item.get("id") or item.get("month_id")
        if month_id is None:
            continue
        # Faol bo'lmagan tariflarni o'tkazib yuboramiz
        if item.get("status") is False or item.get("month_status") is False:
            continue
        try:
            money_val = float(item.get("money")) if item.get("money") is not None else None
        except (TypeError, ValueError):
            money_val = None
        # Test tariflarni yashirish — minds shared baza, boshqa adminlar past
        # narxlar bilan tariflar qoldirgan bo'lishi mumkin.
        if money_val is None or money_val < MIN_TARIFF_MONEY:
            continue
        out.append(
            MonthOut(
                id=int(month_id),
                number=item.get("number") or item.get("months"),
                name=item.get("name"),
                money=money_val,
            )
        )
    out.sort(key=lambda m: (m.number or 0, m.id))
    return out


async def _ensure_user_in_minds(user: User) -> None:
    """Foydalanuvchi minds'da yo'q bo'lsa yaratamiz (idempotent)."""
    try:
        await minds.ensure_user(user.telegram_id, name=_full_name(user))
    except MindsError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"To'lov tizimi xatoligi: {exc}",
        ) from exc


@router.get("/status", response_model=PaymentStatusOut)
async def payment_status(
    user: User = Depends(get_current_user),
) -> PaymentStatusOut:
    """Joriy obuna holati + mavjud tariflar."""
    if not minds.enabled:
        # minds sozlanmagan — bo'sh javob qaytaramiz, frontend buni nazarda tutadi
        return PaymentStatusOut(subscription=SubscriptionOut(is_active=user.is_admin))

    await _ensure_user_in_minds(user)
    minds_user = await fetch_minds_user(user.telegram_id)
    try:
        months_raw = await minds.list_months(user.telegram_id)
    except MindsError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Tariflarni olishda xatolik: {exc}",
        ) from exc

    return PaymentStatusOut(
        subscription=_build_subscription(minds_user, user.is_admin),
        months=_normalize_months(months_raw),
    )


@router.post("/card/add", response_model=CardAddOut)
async def card_add(
    payload: CardAddIn,
    user: User = Depends(get_current_user),
) -> CardAddOut:
    """Karta ma'lumotini minds'ga yuboradi, SMS kod kutiladi."""
    if not minds.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="To'lov tizimi sozlanmagan",
        )
    await _ensure_user_in_minds(user)
    try:
        raw = await minds.add_card(
            user_id=user.telegram_id,
            month=payload.month,
            card_number=payload.card_number.replace(" ", ""),
            expiry_year=payload.expiry_year,
            expiry_month=payload.expiry_month,
        )
    except MindsError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    transaction_id = None
    if isinstance(raw, dict):
        transaction_id = raw.get("transaction_id") or raw.get("id") or raw.get("transactionId")
    if transaction_id is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="To'lov tizimi transaction_id qaytarmadi",
        )
    return CardAddOut(transaction_id=int(transaction_id), raw=raw if isinstance(raw, dict) else None)


@router.post("/card/confirm", response_model=CardConfirmOut)
async def card_confirm(
    payload: CardConfirmIn,
    user: User = Depends(get_current_user),
) -> CardConfirmOut:
    """SMS kodni tasdiqlaydi, obuna muddatini yangilaydi."""
    if not minds.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="To'lov tizimi sozlanmagan",
        )
    try:
        await minds.confirm_card(
            user_id=user.telegram_id,
            month=payload.month,
            transaction_id=payload.transaction_id,
            code=payload.code,
        )
    except MindsError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    # to'lovdan keyin keshni tozalab, yangi deadline'ni o'qiymiz
    invalidate_minds_user(user.telegram_id)
    minds_user = await fetch_minds_user(user.telegram_id)
    return CardConfirmOut(
        ok=True,
        subscription=_build_subscription(minds_user, user.is_admin),
    )
