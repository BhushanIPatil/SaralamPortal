from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, platform, services, jobs, applications, subscriptions, ratings, notifications, search
from app.api.v1.endpoints.admin import (
    dashboard,
    users as admin_users,
    services as admin_services,
    jobs as admin_jobs,
    offers,
    subscriptions as admin_subscriptions,
    ratings as admin_ratings,
    analytics,
)

api_router = APIRouter()

# Public
api_router.include_router(platform.router)
api_router.include_router(search.router)  # /categories, /search
api_router.include_router(services.router)
api_router.include_router(jobs.router)

# Auth
api_router.include_router(auth.router)

# User & app
api_router.include_router(users.router)
api_router.include_router(applications.router)  # jobs/{id}/apply, applications/my, etc.
api_router.include_router(subscriptions.router)
api_router.include_router(ratings.router)
api_router.include_router(notifications.router)

# Admin
api_router.include_router(dashboard.router, prefix="/admin")
api_router.include_router(admin_users.router, prefix="/admin")
api_router.include_router(admin_services.router, prefix="/admin")
api_router.include_router(admin_jobs.router, prefix="/admin")
api_router.include_router(offers.router, prefix="/admin")
api_router.include_router(admin_subscriptions.router, prefix="/admin")
api_router.include_router(admin_ratings.router, prefix="/admin")
api_router.include_router(analytics.router, prefix="/admin")
