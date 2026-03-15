from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, UserProfile, Address
from app.core.exceptions import NotFoundError
from app.utils.pagination import offset_for_page, clamp_page_size


class UserService:
    async def get_by_id(self, db: AsyncSession, user_id: UUID) -> User | None:
        result = await db.execute(
            select(User).where(User.id == user_id).options(selectinload(User.profiles))
        )
        return result.scalar_one_or_none()

    async def get_me(self, db: AsyncSession, user_id: UUID) -> User:
        user = await self.get_by_id(db, user_id)
        if not user:
            raise NotFoundError("User not found")
        return user

    async def update_me(
        self, db: AsyncSession, user: User, full_name: str | None = None, phone: str | None = None
    ) -> User:
        if full_name is not None:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        await db.flush()
        await db.refresh(user)
        return user

    async def get_addresses(self, db: AsyncSession, user_id: UUID) -> list[Address]:
        result = await db.execute(
            select(Address).where(Address.user_id == user_id, Address.is_active == True)
        )
        return list(result.scalars().all())

    async def add_address(
        self,
        db: AsyncSession,
        user_id: UUID,
        address_type: str,
        address_line1: str,
        address_line2: str | None,
        city: str,
        state: str | None,
        country: str,
        pincode: str | None,
        latitude: str | None,
        longitude: str | None,
        is_primary: bool,
    ) -> Address:
        addr = Address(
            user_id=user_id,
            address_type=address_type,
            address_line1=address_line1,
            address_line2=address_line2,
            city=city,
            state=state,
            country=country,
            pincode=pincode,
            latitude=latitude,
            longitude=longitude,
            is_primary=is_primary,
        )
        db.add(addr)
        await db.flush()
        await db.refresh(addr)
        return addr

    async def get_address(self, db: AsyncSession, address_id: UUID, user_id: UUID) -> Address:
        result = await db.execute(
            select(Address).where(
                Address.id == address_id, Address.user_id == user_id, Address.is_active == True
            )
        )
        addr = result.scalar_one_or_none()
        if not addr:
            raise NotFoundError("Address not found")
        return addr

    async def update_address(
        self, db: AsyncSession, addr: Address, **kwargs
    ) -> Address:
        for k, v in kwargs.items():
            if hasattr(addr, k) and v is not None:
                setattr(addr, k, v)
        await db.flush()
        await db.refresh(addr)
        return addr

    async def delete_address(self, db: AsyncSession, addr: Address) -> None:
        addr.is_active = False
        await db.flush()

    async def search_providers(
        self,
        db: AsyncSession,
        query: str,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[User], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(User).where(User.role == "provider", User.is_suspended == False)
        count_q = select(func.count(User.id)).where(User.role == "provider", User.is_suspended == False)
        if query and query.strip():
            like = f"%{query.strip()}%"
            q = q.where(or_(User.full_name.ilike(like), User.email.ilike(like)))
            count_q = count_q.where(or_(User.full_name.ilike(like), User.email.ilike(like)))
        total = (await db.execute(count_q)).scalar() or 0
        q = q.offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total


user_service = UserService()
