from pydantic import BaseModel


class PlatformInfoResponse(BaseModel):
    app_name: str
    app_version: str
    days_since_launch: int
    total_providers: int | None = None
    total_seekers: int | None = None
    total_jobs: int | None = None
    total_cities: int | None = None


class PlatformStatsResponse(BaseModel):
    total_providers: int
    total_seekers: int
    total_jobs: int
    total_cities: int
    featured_categories: list[dict] = []
