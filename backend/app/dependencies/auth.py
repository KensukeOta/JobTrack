import uuid
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..models.user import User
from ..security.jwt import decode_access_token

SessionDep = Annotated[Session, Depends(get_session)]
AccessTokenCookie = Annotated[str | None, Cookie(alias="access_token")]


def get_current_user(
    session: SessionDep,
    access_token: AccessTokenCookie = None,
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証が必要です。",
    )

    if access_token is None:
        raise credentials_exception

    try:
        payload = decode_access_token(access_token)

        subject = payload.get("sub")

        if not isinstance(subject, str):
            raise credentials_exception

        user_id = uuid.UUID(subject)

    except (jwt.InvalidTokenError, ValueError):
        raise credentials_exception from None

    user = session.get(User, user_id)

    if user is None:
        raise credentials_exception

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
