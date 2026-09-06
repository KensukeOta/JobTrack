from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi import status
from fastapi.testclient import TestClient


def today() -> date:
    return datetime.now(UTC).date()


def register_and_login(
    client: TestClient,
    *,
    email: str = "test@example.com",
    password: str = "password123",
) -> dict[str, str]:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": password,
        },
    )
    assert register_response.status_code == status.HTTP_201_CREATED

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    assert login_response.status_code == status.HTTP_200_OK

    csrf_token = client.cookies.get("csrf_token")
    assert csrf_token is not None

    return {"csrf_token": csrf_token}


def create_test_job(
    client: TestClient,
    csrf_token: str,
    **overrides: object,
) -> dict:
    payload: dict[str, object] = {
        "company_name": "株式会社Example",
        "job_title": "Webエンジニア",
    }
    payload.update(overrides)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": csrf_token,
        },
        json=payload,
    )

    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


def test_dashboard_summary_with_no_jobs(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_200_OK

    assert response.json() == {
        "total_jobs": 0,
        "active_jobs": 0,
        "status_counts": {
            "interested": 0,
            "planned": 0,
            "applied": 0,
            "screening": 0,
            "interview": 0,
            "offer": 0,
            "rejected": 0,
            "withdrawn": 0,
        },
        "upcoming_actions": [],
    }


def test_dashboard_summary_counts_total_jobs(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    for index in range(3):
        create_test_job(
            client,
            auth["csrf_token"],
            company_name=f"株式会社{index}",
        )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total_jobs"] == 3


@pytest.mark.parametrize(
    "job_status",
    [
        "interested",
        "planned",
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
    ],
)
def test_dashboard_summary_counts_each_status(
    client: TestClient,
    job_status: str,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        status=job_status,
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_200_OK

    counts = response.json()["status_counts"]

    assert counts[job_status] == 1
    assert sum(counts.values()) == 1


def test_dashboard_summary_counts_only_active_jobs(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    statuses = [
        "interested",
        "planned",
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
    ]

    for job_status in statuses:
        create_test_job(
            client,
            auth["csrf_token"],
            company_name=f"株式会社{job_status}",
            status=job_status,
        )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    data = response.json()

    assert data["total_jobs"] == 8
    assert data["active_jobs"] == 6


def test_dashboard_summary_includes_action_for_today(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        next_action="面接",
        next_action_date=today().isoformat(),
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    actions = response.json()["upcoming_actions"]

    assert len(actions) == 1
    assert actions[0]["next_action"] == "面接"
    assert actions[0]["next_action_date"] == today().isoformat()


def test_dashboard_summary_excludes_past_actions(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    yesterday = today() - timedelta(days=1)

    create_test_job(
        client,
        auth["csrf_token"],
        next_action="過去の面接",
        next_action_date=yesterday.isoformat(),
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.json()["upcoming_actions"] == []


def test_dashboard_summary_excludes_jobs_without_action_date(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        next_action="日程未定の面接",
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.json()["upcoming_actions"] == []


def test_dashboard_summary_orders_upcoming_actions_by_date(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    today_date = today()

    dates = [
        today_date + timedelta(days=3),
        today_date + timedelta(days=1),
        today_date + timedelta(days=2),
    ]

    for index, action_date in enumerate(dates):
        create_test_job(
            client,
            auth["csrf_token"],
            company_name=f"株式会社{index}",
            next_action=f"Action {index}",
            next_action_date=action_date.isoformat(),
        )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    actions = response.json()["upcoming_actions"]

    actual_dates = [action["next_action_date"] for action in actions]

    assert actual_dates == [
        (today_date + timedelta(days=1)).isoformat(),
        (today_date + timedelta(days=2)).isoformat(),
        (today_date + timedelta(days=3)).isoformat(),
    ]


def test_dashboard_summary_limits_upcoming_actions_to_five(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    today_date = today()

    for index in range(6):
        create_test_job(
            client,
            auth["csrf_token"],
            company_name=f"株式会社{index}",
            next_action=f"Action {index}",
            next_action_date=(today_date + timedelta(days=index)).isoformat(),
        )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    actions = response.json()["upcoming_actions"]

    assert len(actions) == 5

    assert [action["next_action"] for action in actions] == [
        "Action 0",
        "Action 1",
        "Action 2",
        "Action 3",
        "Action 4",
    ]


def test_dashboard_summary_allows_upcoming_action_without_description(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        next_action_date=today().isoformat(),
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    actions = response.json()["upcoming_actions"]

    assert len(actions) == 1
    assert actions[0]["next_action"] is None


def test_dashboard_summary_excludes_other_users_jobs(
    client: TestClient,
) -> None:
    user_a = register_and_login(
        client,
        email="user-a@example.com",
    )

    create_test_job(
        client,
        user_a["csrf_token"],
        company_name="株式会社UserA",
        status="interview",
        next_action="User Aの面接",
        next_action_date=today().isoformat(),
    )

    client.post("/api/v1/auth/logout")

    user_b = register_and_login(
        client,
        email="user-b@example.com",
    )

    create_test_job(
        client,
        user_b["csrf_token"],
        company_name="株式会社UserB",
        status="applied",
        next_action="User Bの面接",
        next_action_date=today().isoformat(),
    )

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total_jobs"] == 1
    assert data["active_jobs"] == 1

    assert data["status_counts"]["applied"] == 1
    assert data["status_counts"]["interview"] == 0

    assert len(data["upcoming_actions"]) == 1
    assert data["upcoming_actions"][0]["company_name"] == "株式会社UserB"


def test_dashboard_summary_without_authentication_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_dashboard_summary_does_not_require_csrf_header(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.get(
        "/api/v1/dashboard/summary",
    )

    assert response.status_code == status.HTTP_200_OK
