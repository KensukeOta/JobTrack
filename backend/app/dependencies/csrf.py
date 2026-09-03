import hmac
from typing import Annotated

from fastapi import Cookie, Depends, Header, HTTPException, status

from ..dependencies.auth import CurrentUserDep
from ..security.csrf import verify_csrf_token

CsrfCookie = Annotated[
    str | None,
    Cookie(alias="csrf_token"),
]

CsrfHeader = Annotated[
    str | None,
    Header(alias="X-CSRF-Token"),
]


def verify_csrf(
    current_user: CurrentUserDep,
    csrf_cookie: CsrfCookie = None,
    csrf_header: CsrfHeader = None,
) -> None:
    if csrf_cookie is None or csrf_header is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRFトークンが無効です。",
        )

    if not verify_csrf_token(
        token=csrf_cookie,
        user_id=str(current_user.id),
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRFトークンが無効です。",
        )

    if not hmac.compare_digest(
        csrf_cookie,
        csrf_header,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRFトークンが無効です。",
        )


CsrfProtectionDep = Annotated[
    None,
    Depends(verify_csrf),
]
