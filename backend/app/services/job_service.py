from sqlmodel import Session

from ..models.job import Job
from ..models.user import User
from ..schemas.job import JobCreate


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
