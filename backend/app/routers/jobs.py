import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from ..database import get_session
from ..dependencies.auth import CurrentUserDep
from ..dependencies.csrf import CsrfProtectionDep
from ..models.job import JobStatus
from ..schemas.job import (
    JobCreate,
    JobListResponse,
    JobResponse,
    JobSort,
    JobUpdate,
    SortOrder,
)
from ..services.job_service import create_job, get_job_by_id, get_jobs, update_job

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


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUserDep,
) -> JobResponse:
    job = get_job_by_id(
        session=session,
        current_user=current_user,
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求人応募が見つかりません。",
        )

    return job


@router.patch(
    "/{job_id}",
    response_model=JobResponse,
)
def update_job_endpoint(
    job_id: uuid.UUID,
    job_update: JobUpdate,
    session: SessionDep,
    current_user: CurrentUserDep,
    _: CsrfProtectionDep,
) -> JobResponse:
    job = get_job_by_id(
        session=session,
        current_user=current_user,
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求人応募が見つかりません。",
        )

    try:
        return update_job(
            session=session,
            job=job,
            job_update=job_update,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc
