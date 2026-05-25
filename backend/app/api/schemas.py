"""Pydantic sxemalari — API javoblari."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Foydalanuvchi ---
class UserOut(ORMModel):
    id: int
    telegram_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    is_admin: bool
    notifications_enabled: bool
    created_at: datetime


# --- Obuna (minds) ---
class SubscriptionOut(BaseModel):
    is_active: bool = False
    deadline: str | None = None  # YYYY-MM-DD


# --- Bo'lim ---
class SectionOut(ORMModel):
    id: int
    title: str
    image_url: str | None
    lesson_count: int = 0


# --- Darslik (qisqa karta ko'rinishi) ---
class LessonCardOut(ORMModel):
    id: int
    section_id: int
    title: str
    image_url: str | None
    is_new: bool
    published_at: datetime | None


# --- Darslik (to'liq) ---
class LessonDetailOut(ORMModel):
    id: int
    section_id: int
    section_title: str | None = None
    title: str
    image_url: str | None
    body: str
    warning: str | None
    video_url: str | None
    cta_label: str | None
    cta_url: str | None
    is_new: bool
    published_at: datetime | None
    is_saved: bool = False


# --- Bo'lim ichidagi darsliklar ---
class SectionDetailOut(ORMModel):
    id: int
    title: str
    image_url: str | None
    lessons: list[LessonCardOut] = []


# --- Banner ---
class BannerOut(ORMModel):
    id: int
    title: str
    subtitle: str | None
    image_url: str | None
    badge_text: str | None
    lesson_id: int | None


# --- FAQ ---
class FaqOut(ORMModel):
    id: int
    question: str
    answer: str


# --- Bosh sahifa ---
class HomeOut(BaseModel):
    banners: list[BannerOut] = []
    sections: list[SectionOut] = []
    section_count: int = 0
    referral_link: str = ""
    subscription: SubscriptionOut | None = None


# --- Profil ---
class RecentLessonOut(BaseModel):
    id: int
    section_id: int
    title: str
    image_url: str | None
    viewed_at: datetime


class ReferredFriendOut(BaseModel):
    first_name: str | None
    username: str | None
    created_at: datetime


class ProfileOut(BaseModel):
    user: UserOut
    recent_count: int = 0
    referral_count: int = 0
    referral_link: str = ""
    subscription: SubscriptionOut = SubscriptionOut()


# --- To'lov / Obuna ---
class MonthOut(BaseModel):
    id: int
    number: int | None = None
    name: str | None = None
    money: float | None = None


class PaymentStatusOut(BaseModel):
    subscription: SubscriptionOut
    months: list[MonthOut] = []


class CardAddIn(BaseModel):
    month: int
    card_number: str
    expiry_year: str
    expiry_month: str


class CardAddOut(BaseModel):
    transaction_id: int
    raw: dict | None = None


class CardConfirmIn(BaseModel):
    month: int
    transaction_id: int
    code: str


class CardConfirmOut(BaseModel):
    ok: bool = True
    subscription: SubscriptionOut


# --- Umumiy javoblar ---
class SavedToggleOut(BaseModel):
    is_saved: bool


class OkOut(BaseModel):
    ok: bool = True
