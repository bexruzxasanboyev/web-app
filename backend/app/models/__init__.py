"""Barcha modellar shu yerda import qilinadi (Alembic autogenerate uchun)."""
from app.models.banner import Banner
from app.models.base import Base
from app.models.engagement import LessonView, Referral, SavedLesson
from app.models.faq import FaqItem
from app.models.lesson import Lesson
from app.models.section import Section
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "Section",
    "Lesson",
    "Banner",
    "FaqItem",
    "SavedLesson",
    "LessonView",
    "Referral",
]
