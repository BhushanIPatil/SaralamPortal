from uuid import UUID
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.service import ServiceCategory, Service
from app.core.exceptions import NotFoundError
from app.utils.pagination import offset_for_page, clamp_page_size


class ServiceService:
    async def get_categories_hierarchy(self, db: AsyncSession) -> list[ServiceCategory]:
        result = await db.execute(
            select(ServiceCategory)
            .where(
                ServiceCategory.is_active == True,
                ServiceCategory.parent_category_id.is_(None),
            )
            .order_by(ServiceCategory.sort_order, ServiceCategory.name)
        )
        roots = list(result.scalars().all())
        for root in roots:
            result = await db.execute(
                select(ServiceCategory)
                .where(
                    ServiceCategory.parent_category_id == root.id,
                    ServiceCategory.is_active == True,
                )
                .order_by(ServiceCategory.sort_order, ServiceCategory.name)
            )
            root.children = list(result.scalars().all())
        return roots

    async def list_services(
        self,
        db: AsyncSession,
        category_id: UUID | None = None,
        city: str | None = None,
        price_min: float | None = None,
        price_max: float | None = None,
        rating_min: float | None = None,
        sort_by: str = "created_at",
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Service], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Service).where(Service.is_active == True)
        if category_id:
            q = q.where(Service.category_id == category_id)
        if rating_min is not None:
            q = q.where(Service.avg_rating >= rating_min)
        if price_min is not None:
            q = q.where(Service.base_price >= price_min)
        if price_max is not None:
            q = q.where(Service.base_price <= price_max)
        if city:
            pass  # city filter would require join to provider addresses
        order = Service.created_at.desc()
        if sort_by == "rating":
            order = Service.avg_rating.desc()
        elif sort_by == "price":
            order = Service.base_price.asc()
        count_q = select(func.count(Service.id)).where(Service.is_active == True)
        if category_id:
            count_q = count_q.where(Service.category_id == category_id)
        if rating_min is not None:
            count_q = count_q.where(Service.avg_rating >= rating_min)
        if price_min is not None:
            count_q = count_q.where(Service.base_price >= price_min)
        if price_max is not None:
            count_q = count_q.where(Service.base_price <= price_max)
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(order).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, service_id: UUID) -> Service | None:
        result = await db.execute(
            select(Service).where(Service.id == service_id, Service.is_active == True)
        )
        return result.scalar_one_or_none()

    async def search(
        self,
        db: AsyncSession,
        query: str,
        category_id: UUID | None = None,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Service], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Service).where(Service.is_active == True)
        count_q = select(func.count(Service.id)).where(Service.is_active == True)
        if query and query.strip() and query != "%":
            like = f"%{query.strip()}%"
            q = q.where(or_(Service.title.ilike(like), Service.description.ilike(like)))
            count_q = count_q.where(or_(Service.title.ilike(like), Service.description.ilike(like)))
        if category_id:
            q = q.where(Service.category_id == category_id)
            count_q = count_q.where(Service.category_id == category_id)
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(Service.created_at.desc()).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total

    async def get_my_services(self, db: AsyncSession, provider_id: UUID) -> list[Service]:
        result = await db.execute(
            select(Service).where(
                Service.provider_id == provider_id, Service.is_active == True
            )
        )
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, provider_id: UUID, **kwargs
    ) -> Service:
        svc = Service(provider_id=provider_id, **kwargs)
        db.add(svc)
        await db.flush()
        await db.refresh(svc)
        return svc

    async def update(self, db: AsyncSession, service: Service, **kwargs) -> Service:
        for k, v in kwargs.items():
            if hasattr(service, k) and v is not None:
                setattr(service, k, v)
        await db.flush()
        await db.refresh(service)
        return service

    async def deactivate(self, db: AsyncSession, service: Service) -> None:
        service.is_active = False
        await db.flush()


service_service = ServiceService()
