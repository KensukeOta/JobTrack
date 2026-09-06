from fastapi import APIRouter

from ..dependencies.auth import CurrentUserDep, SessionDep
from ..schemas.dashboard import DashboardSummaryResponse
from ..services.dashboard_service import get_dashboard_summary

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
) -> DashboardSummaryResponse:
    return get_dashboard_summary(
        session=session,
        current_user=current_user,
    )
