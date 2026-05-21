"""FAQ endpoint'i."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import FaqOut
from app.core.database import get_session
from app.models.faq import FaqItem
from app.models.user import User

router = APIRouter(prefix="/faq", tags=["faq"])


@router.get("", response_model=list[FaqOut])
async def list_faq(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[FaqOut]:
    items = (
        await session.execute(select(FaqItem).order_by(FaqItem.position))
    ).scalars().all()
    return [FaqOut.model_validate(item) for item in items]
