import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .job import Job


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    name: str = Field(
        min_length=1,
        max_length=100,
        nullable=False,
    )

    email: str = Field(
        max_length=255,
        nullable=False,
        unique=True,
        index=True,
    )

    password_hash: str = Field(
        max_length=255,
        nullable=False,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
        ),
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
        ),
    )

    jobs: list["Job"] = Relationship(
        back_populates="user",
        cascade_delete=True,
    )
