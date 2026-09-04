import uuid
from datetime import date, datetime
from enum import StrEnum

from pydantic import model_validator
from sqlmodel import Field, SQLModel

from ..models.job import EmploymentType, JobStatus


class JobCreate(SQLModel):
    company_name: str = Field(
        min_length=1,
        max_length=200,
    )
    job_title: str = Field(
        min_length=1,
        max_length=200,
    )
    status: JobStatus = JobStatus.INTERESTED

    job_url: str | None = Field(
        default=None,
        max_length=2048,
    )
    location: str | None = Field(
        default=None,
        max_length=200,
    )
    employment_type: EmploymentType | None = None

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
    next_action_date: date | None = None

    memo: str | None = Field(
        default=None,
        max_length=5000,
    )

    @model_validator(mode="after")
    def validate_salary_range(self) -> "JobCreate":
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_max < self.salary_min
        ):
            raise ValueError("salary_maxはsalary_min以上である必要があります。")

        return self


class JobResponse(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID

    company_name: str
    job_title: str
    status: JobStatus

    job_url: str | None
    location: str | None
    employment_type: EmploymentType | None

    salary_min: int | None
    salary_max: int | None

    next_action: str | None
    next_action_date: date | None
    memo: str | None

    created_at: datetime
    updated_at: datetime


class JobListResponse(SQLModel):
    items: list[JobResponse]
    total: int
    page: int
    page_size: int


class JobSort(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    NEXT_ACTION_DATE = "next_action_date"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"
