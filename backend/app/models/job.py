import uuid
from datetime import UTC, date, datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class JobStatus(StrEnum):
    INTERESTED = "interested"
    PLANNED = "planned"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class EmploymentType(StrEnum):
    FULL_TIME = "full_time"
    CONTRACT = "contract"
    PART_TIME = "part_time"
    TEMPORARY = "temporary"
    OTHER = "other"


class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    user_id: uuid.UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        ondelete="CASCADE",
    )

    company_name: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
    )

    job_title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
    )

    status: JobStatus = Field(
        default=JobStatus.INTERESTED,
        sa_column=Column(
            SAEnum(
                JobStatus,
                name="jobstatus",
                values_callable=lambda enum_class: [
                    member.value for member in enum_class
                ],
            ),
            nullable=False,
            index=True,
        ),
    )

    job_url: str | None = Field(
        default=None,
        max_length=2048,
    )

    location: str | None = Field(
        default=None,
        max_length=200,
    )

    employment_type: EmploymentType | None = Field(
        default=None,
        sa_column=Column(
            SAEnum(
                EmploymentType,
                name="employmenttype",
                values_callable=lambda enum_class: [
                    member.value for member in enum_class
                ],
            ),
            nullable=True,
        ),
    )

    salary_min: int | None = Field(
        default=None,
        ge=0,
    )

    salary_max: int | None = Field(
        default=None,
        ge=0,
    )

    next_action: str | None = Field(
        default=None,
        max_length=300,
    )

    next_action_date: date | None = Field(
        default=None,
        index=True,
    )

    memo: str | None = Field(
        default=None,
        max_length=5000,
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
            index=True,
        ),
    )

    user: "User" = Relationship(
        back_populates="jobs",
    )
