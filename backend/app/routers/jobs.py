from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from ..database import get_session
from ..dependencies.auth import CurrentUserDep
from ..dependencies.csrf import CsrfProtectionDep
from ..schemas.job import JobCreate, JobResponse
from ..services.job_service import create_job

router = APIRouter(
    prefix="/api/v1/jobs",
    tags=["jobs"],
)

SessionDep = Annotated[
    Session,
    Depends(get_session),
]


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_endpoint(
    job_create: JobCreate,
    session: SessionDep,
    current_user: CurrentUserDep,
    _: CsrfProtectionDep,
) -> JobResponse:
    return create_job(
        session=session,
        current_user=current_user,
        job_create=job_create,
    )
