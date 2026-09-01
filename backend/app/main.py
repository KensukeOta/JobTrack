from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlmodel import Session

from .database import get_session
from .routers.auth import router as auth_router

app = FastAPI(
    title="JobTrack API",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/health")
def health_check(
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    session.exec(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "ok",
    }
