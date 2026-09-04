from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from ..database import get_session
from ..dependencies.auth import CurrentUserDep
from ..dependencies.csrf import CsrfProtectionDep
from ..models.job import JobStatus
from ..schemas.job import JobCreate, JobListResponse, JobResponse, JobSort, SortOrder
from ..services.job_service import create_job, get_jobs

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


@router.get(
    "",
    response_model=JobListResponse,
)
def list_jobs(
    session: SessionDep,
    current_user: CurrentUserDep,
    q: Annotated[
        str | None,
        Query(max_length=200),
    ] = None,
    job_status: Annotated[
        JobStatus | None,
        Query(alias="status"),
    ] = None,
    sort: Annotated[
        JobSort,
        Query(),
    ] = JobSort.CREATED_AT,
    order: Annotated[
        SortOrder,
        Query(),
    ] = SortOrder.DESC,
    page: Annotated[
        int,
        Query(ge=1),
    ] = 1,
    page_size: Annotated[
        int,
        Query(ge=1, le=100),
    ] = 20,
) -> JobListResponse:
    jobs, total = get_jobs(
        session=session,
        current_user=current_user,
        q=q,
        status=job_status,
        sort=sort,
        order=order,
        page=page,
        page_size=page_size,
    )

    return JobListResponse(
        items=jobs,
        total=total,
        page=page,
        page_size=page_size,
    )
