from typing import Generic, TypeVar, List
from app.core.config import settings
from app.schemas.base import PaginatedResponse

T = TypeVar("T")


def paginate(
    items: List[T],
    total: int,
    page: int = 1,
    page_size: int | None = None,
) -> PaginatedResponse[T]:
    page_size = page_size or settings.default_page_size
    page_size = min(page_size, settings.max_page_size)
    total_pages = max(1, (total + page_size - 1) // page_size) if page_size else 1
    return PaginatedResponse(
        data=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


def clamp_page_size(size: int | None) -> int:
    if size is None:
        return settings.default_page_size
    return min(max(1, size), settings.max_page_size)


def offset_for_page(page: int, page_size: int) -> int:
    return max(0, (page - 1) * page_size)
