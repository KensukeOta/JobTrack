import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://jobtrack:jobtrack@localhost:5432/jobtrack",
)
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "0123456789abcdef0123456789abcdef",
)

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture
def session() -> Generator[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client(session: Session) -> Generator[TestClient]:
    def get_test_session() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = get_test_session

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
