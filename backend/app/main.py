from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlmodel import Session

from .database import get_session
from .routers.auth import router as auth_router
from .routers.dashboard import router as dashboard_router
from .routers.jobs import router as jobs_router
from .routers.users import router as users_router

app = FastAPI(
    title="JobTrack API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(dashboard_router)


@app.get("/health")
def health_check(
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    session.exec(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "ok",
    }
