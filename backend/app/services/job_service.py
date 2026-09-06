import uuid
from datetime import UTC, datetime

from sqlalchemy import func, or_
from sqlmodel import Session, select

from ..models.job import Job, JobStatus
from ..models.user import User
from ..schemas.job import JobCreate, JobSort, JobUpdate, SortOrder


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


def get_job_by_id(
    session: Session,
    current_user: User,
    job_id: uuid.UUID,
) -> Job | None:
    statement = select(Job).where(
        Job.id == job_id,
        Job.user_id == current_user.id,
    )

    return session.exec(statement).first()


def update_job(
    session: Session,
    job: Job,
    job_update: JobUpdate,
) -> Job:
    update_data = job_update.model_dump(
        exclude_unset=True,
    )

    salary_min = update_data.get(
        "salary_min",
        job.salary_min,
    )
    salary_max = update_data.get(
        "salary_max",
        job.salary_max,
    )

    if salary_min is not None and salary_max is not None and salary_max < salary_min:
        raise ValueError("salary_maxはsalary_min以上である必要があります。")

    for field, value in update_data.items():
        setattr(job, field, value)

    job.updated_at = datetime.now(UTC)

    session.add(job)
    session.commit()
    session.refresh(job)

    return job
