from app.routers.auth import router as auth_router
from app.routers.patients import router as patients_router
from app.routers.staff import router as staff_router
from app.routers.resources import router as resources_router
from app.routers.ai import router as ai_router
from app.routers.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "patients_router",
    "staff_router",
    "resources_router",
    "ai_router",
    "analytics_router"
]

