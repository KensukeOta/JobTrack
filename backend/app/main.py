from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlmodel import Session

from .database import get_session

app = FastAPI(
    title="JobTrack API",
    version="0.1.0",
)


@app.get("/health")
def health_check(
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    session.exec(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "ok",
    }
