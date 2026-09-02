from fastapi import APIRouter

from ..dependencies.auth import CurrentUserDep
from ..schemas.user import UserResponse

router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: CurrentUserDep,
) -> UserResponse:
    return current_user
