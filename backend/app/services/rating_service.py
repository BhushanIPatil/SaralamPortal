from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rating import Rating, RatingResponse
from app.core.exceptions import NotFoundError, ForbiddenError
from app.utils.pagination import offset_for_page, clamp_page_size


class RatingService:
    async def create(
        self,
        db: AsyncSession,
        reviewer_id: UUID,
        reviewee_id: UUID,
        rating: float,
        job_id: UUID | None = None,
        application_id: UUID | None = None,
        title: str | None = None,
        review_text: str | None = None,
        tags: str | None = None,
    ) -> Rating:
        r = Rating(
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            rating=rating,
            job_id=job_id,
            application_id=application_id,
            title=title,
            review_text=review_text,
            tags=tags,
            is_verified_transaction=bool(application_id),
        )
        db.add(r)
        await db.flush()
        await db.refresh(r)
        return r

    async def list_for_provider(
        self,
        db: AsyncSession,
        provider_id: UUID,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Rating], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Rating).where(
            Rating.reviewee_id == provider_id, Rating.is_public == True, Rating.is_active == True
        )
        count_q = select(func.count(Rating.id)).where(
            Rating.reviewee_id == provider_id, Rating.is_public == True, Rating.is_active == True
        )
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(Rating.created_at.desc()).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, rating_id: UUID) -> Rating | None:
        result = await db.execute(select(Rating).where(Rating.id == rating_id))
        return result.scalar_one_or_none()

    async def respond(
        self, db: AsyncSession, rating_id: UUID, responder_id: UUID, response_text: str
    ) -> RatingResponse:
        rating = await self.get_by_id(db, rating_id)
        if not rating:
            raise NotFoundError("Rating not found")
        if rating.reviewee_id != responder_id:
            raise ForbiddenError("Only the reviewee can respond")
        resp = RatingResponse(
            rating_id=rating_id, responder_id=responder_id, response_text=response_text
        )
        db.add(resp)
        await db.flush()
        await db.refresh(resp)
        return resp


rating_service = RatingService()
