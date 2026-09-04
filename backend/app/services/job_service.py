from sqlalchemy import func, or_
from sqlmodel import Session, select

from ..models.job import Job, JobStatus
from ..models.user import User
from ..schemas.job import JobCreate, JobSort, SortOrder


def create_job(
    session: Session,
    current_user: User,
    job_create: JobCreate,
) -> Job:
    job = Job(
        user_id=current_user.id,
        **job_create.model_dump(),
    )

    session.add(job)
    session.commit()
    session.refresh(job)

    return job


def get_jobs(
    session: Session,
    current_user: User,
    *,
    q: str | None,
    status: JobStatus | None,
    sort: JobSort,
    order: SortOrder,
    page: int,
    page_size: int,
) -> tuple[list[Job], int]:
    filters = [
        Job.user_id == current_user.id,
    ]

    if q:
        keyword = f"%{q}%"

        filters.append(
            or_(
                Job.company_name.ilike(keyword),
                Job.job_title.ilike(keyword),
            )
        )

    if status is not None:
        filters.append(
            Job.status == status,
        )

    count_statement = select(func.count()).select_from(Job).where(*filters)

    total = session.exec(count_statement).one()

    sort_column = {
        JobSort.CREATED_AT: Job.created_at,
        JobSort.UPDATED_AT: Job.updated_at,
        JobSort.NEXT_ACTION_DATE: Job.next_action_date,
    }[sort]

    order_by = sort_column.asc() if order == SortOrder.ASC else sort_column.desc()

    statement = (
        select(Job)
        .where(*filters)
        .order_by(order_by, Job.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    jobs = list(session.exec(statement).all())

    return jobs, total
