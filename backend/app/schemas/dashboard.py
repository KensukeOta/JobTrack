import uuid
from datetime import date

from sqlmodel import SQLModel

from ..models.job import JobStatus


class StatusCounts(SQLModel):
    interested: int
    planned: int
    applied: int
    screening: int
    interview: int
    offer: int
    rejected: int
    withdrawn: int


class UpcomingAction(SQLModel):
    job_id: uuid.UUID
    company_name: str
    job_title: str
    status: JobStatus
    next_action: str | None
    next_action_date: date


class DashboardSummaryResponse(SQLModel):
    total_jobs: int
    active_jobs: int
    status_counts: StatusCounts
    upcoming_actions: list[UpcomingAction]
