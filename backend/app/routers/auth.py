from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..schemas.user import UserCreate, UserResponse
from ..services.auth_service import create_user, get_user_by_email

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_create: UserCreate,
    session: SessionDep,
) -> UserResponse:
    existing_user = get_user_by_email(
        session,
        str(user_create.email),
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="このメールアドレスは既に登録されています。",
        )

    return create_user(
        session,
        user_create,
    )
