"""Kontentni seed_data.json dan bazaga yuklaydi.

Ishlatish:  python -m app.seed

DIQQAT: kontent jadvallari (sections, lessons, banners, faq_items)
to'liq tozalanib, JSON'dan qaytadan yoziladi. Foydalanuvchilar tegilmaydi.
"""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import delete

from app.core.database import async_session
from app.models import Banner, FaqItem, Lesson, Section

DATA_FILE = Path(__file__).resolve().parent.parent / "seed_data.json"


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


async def seed() -> None:
    if not DATA_FILE.exists():
        print(f"XATO: {DATA_FILE} topilmadi")
        return

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    async with async_session() as session:
        # Kontent jadvallarini tozalash
        await session.execute(delete(Banner))
        await session.execute(delete(Lesson))
        await session.execute(delete(FaqItem))
        await session.execute(delete(Section))
        await session.commit()

        # Bo'limlar
        section_ids: dict[str, int] = {}
        for item in data.get("sections", []):
            section = Section(
                title=item["title"],
                image_url=item.get("image_url"),
                position=item.get("position", 0),
            )
            session.add(section)
            await session.flush()
            section_ids[item["key"]] = section.id

        # Darsliklar
        lesson_ids: dict[str, int] = {}
        for item in data.get("lessons", []):
            lesson = Lesson(
                section_id=section_ids[item["section"]],
                title=item["title"],
                image_url=item.get("image_url"),
                body=item.get("body", ""),
                warning=item.get("warning"),
                video_url=item.get("video_url"),
                cta_label=item.get("cta_label"),
                cta_url=item.get("cta_url"),
                is_new=item.get("is_new", False),
                position=item.get("position", 0),
                published_at=_parse_date(item.get("published_at")),
            )
            session.add(lesson)
            await session.flush()
            if item.get("key"):
                lesson_ids[item["key"]] = lesson.id

        # Bannerlar
        for item in data.get("banners", []):
            session.add(
                Banner(
                    title=item["title"],
                    subtitle=item.get("subtitle"),
                    image_url=item.get("image_url"),
                    badge_text=item.get("badge_text"),
                    lesson_id=lesson_ids.get(item.get("lesson")),
                    position=item.get("position", 0),
                )
            )

        # FAQ
        for index, item in enumerate(data.get("faq", [])):
            session.add(
                FaqItem(
                    question=item["question"],
                    answer=item["answer"],
                    position=item.get("position", index),
                )
            )

        await session.commit()

    print(
        f"Seed tugadi: {len(data.get('sections', []))} bo'lim, "
        f"{len(data.get('lessons', []))} darslik, "
        f"{len(data.get('banners', []))} banner, "
        f"{len(data.get('faq', []))} FAQ."
    )


if __name__ == "__main__":
    asyncio.run(seed())
