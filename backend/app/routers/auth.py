from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session

from ..config import get_settings
from ..database import get_session
from ..schemas.user import LoginRequest, LogoutResponse, UserCreate, UserResponse
from ..security.csrf import create_csrf_token
from ..security.jwt import create_access_token
from ..services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)

SessionDep = Annotated[Session, Depends(get_session)]


def _set_auth_cookies(
    response: Response,
    user_id: str,
) -> None:
    access_token = create_access_token(
        subject=user_id,
    )

    csrf_token = create_csrf_token(
        user_id=user_id,
    )

    settings = get_settings()

    max_age = settings.access_token_expire_minutes * 60

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
        max_age=max_age,
    )

    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
        max_age=max_age,
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_create: UserCreate,
    response: Response,
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

    user = create_user(
        session,
        user_create,
    )

    _set_auth_cookies(
        response=response,
        user_id=str(user.id),
    )

    return user


@router.post(
    "/login",
    response_model=UserResponse,
)
def login(
    login_request: LoginRequest,
    response: Response,
    session: SessionDep,
) -> UserResponse:
    user = authenticate_user(
        session,
        str(login_request.email),
        login_request.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません。",
        )

    _set_auth_cookies(
        response=response,
        user_id=str(user.id),
    )

    return user


@router.post(
    "/logout",
    response_model=LogoutResponse,
)
def logout(
    response: Response,
) -> LogoutResponse:
    settings = get_settings()

    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.cookie_secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )

    response.delete_cookie(
        key="csrf_token",
        path="/",
        secure=settings.cookie_secure,
        httponly=False,
        samesite=settings.cookie_samesite,
    )

    return LogoutResponse(
        message="ログアウトしました。",
    )
