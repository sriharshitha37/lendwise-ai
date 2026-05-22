from fastapi import APIRouter

from app.routes.chat import router as chat_router
from app.routes.document import router as document_router
from app.routes.eligibility import router as eligibility_router
from app.routes.health import router as health_router
from app.routes.upload import router as upload_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(chat_router, tags=["Chat"])
api_router.include_router(eligibility_router, tags=["Eligibility"])
api_router.include_router(document_router, tags=["Upload"])
api_router.include_router(upload_router, prefix="/upload", tags=["Upload"])
