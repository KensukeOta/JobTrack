from datetime import UTC, datetime

from sqlalchemy import func
from sqlmodel import Session, select

from ..models.job import Job, JobStatus
from ..models.user import User
from ..schemas.dashboard import (
    DashboardSummaryResponse,
    StatusCounts,
    UpcomingAction,
)

ACTIVE_STATUSES = (
    JobStatus.INTERESTED,
    JobStatus.PLANNED,
    JobStatus.APPLIED,
    JobStatus.SCREENING,
    JobStatus.INTERVIEW,
    JobStatus.OFFER,
)


def get_dashboard_summary(
    session: Session,
    current_user: User,
) -> DashboardSummaryResponse:
    total_jobs = session.exec(
        select(func.count()).select_from(Job).where(Job.user_id == current_user.id)
    ).one()

    active_jobs = session.exec(
        select(func.count())
        .select_from(Job)
        .where(
            Job.user_id == current_user.id,
            Job.status.in_(ACTIVE_STATUSES),
        )
    ).one()

    status_rows = session.exec(
        select(
            Job.status,
            func.count(Job.id),
        )
        .where(Job.user_id == current_user.id)
        .group_by(Job.status)
    ).all()

    status_count_map = {status: count for status, count in status_rows}

    status_counts = StatusCounts(
        interested=status_count_map.get(
            JobStatus.INTERESTED,
            0,
        ),
        planned=status_count_map.get(
            JobStatus.PLANNED,
            0,
        ),
        applied=status_count_map.get(
            JobStatus.APPLIED,
            0,
        ),
        screening=status_count_map.get(
            JobStatus.SCREENING,
            0,
        ),
        interview=status_count_map.get(
            JobStatus.INTERVIEW,
            0,
        ),
        offer=status_count_map.get(
            JobStatus.OFFER,
            0,
        ),
        rejected=status_count_map.get(
            JobStatus.REJECTED,
            0,
        ),
        withdrawn=status_count_map.get(
            JobStatus.WITHDRAWN,
            0,
        ),
    )

    jobs = session.exec(
        select(Job)
        .where(
            Job.user_id == current_user.id,
            Job.next_action_date.is_not(None),
            Job.next_action_date >= datetime.now(UTC).date(),
        )
        .order_by(
            Job.next_action_date.asc(),
            Job.id.asc(),
        )
        .limit(5)
    ).all()

    upcoming_actions = [
        UpcomingAction(
            job_id=job.id,
            company_name=job.company_name,
            job_title=job.job_title,
            status=job.status,
            next_action=job.next_action,
            next_action_date=job.next_action_date,
        )
        for job in jobs
        if job.next_action_date is not None
    ]

    return DashboardSummaryResponse(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        status_counts=status_counts,
        upcoming_actions=upcoming_actions,
    )
