import uuid

from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.job import Job


def register_and_login(
    client: TestClient,
    *,
    email: str = "test@example.com",
) -> dict:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "password123",
        },
    )

    assert register_response.status_code == status.HTTP_201_CREATED

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    assert login_response.status_code == status.HTTP_200_OK

    csrf_token = client.cookies.get("csrf_token")

    assert csrf_token is not None

    return {
        "user": register_response.json(),
        "csrf_token": csrf_token,
    }


def test_create_job(
    client: TestClient,
    session: Session,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "データサイエンティスト",
            "status": "interested",
            "job_url": "https://example.com/jobs/123",
            "location": "大阪府大阪市",
            "employment_type": "full_time",
            "salary_min": 4000000,
            "salary_max": 6000000,
            "next_action": "応募書類を作成する",
            "next_action_date": "2026-09-10",
            "memo": "JobTrackテスト",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()

    assert data["company_name"] == "株式会社Example"
    assert data["job_title"] == "データサイエンティスト"
    assert data["status"] == "interested"
    assert data["employment_type"] == "full_time"
    assert data["salary_min"] == 4000000
    assert data["salary_max"] == 6000000
    assert data["user_id"] == auth["user"]["id"]

    job = session.get(
        Job,
        uuid.UUID(data["id"]),
    )

    assert job is not None
    assert str(job.user_id) == auth["user"]["id"]
    assert job.company_name == "株式会社Example"


def test_create_job_with_minimum_fields(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "バックエンドエンジニア",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()

    assert data["status"] == "interested"
    assert data["job_url"] is None
    assert data["employment_type"] is None
    assert data["salary_min"] is None
    assert data["salary_max"] is None


def test_create_job_ignores_user_id_from_request(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "user_id": "11111111-1111-1111-1111-111111111111",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["user_id"] == auth["user"]["id"]


def test_create_job_without_authentication_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/jobs",
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_job_without_csrf_header_returns_forbidden(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_create_job_with_invalid_csrf_token_returns_forbidden(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": "invalid-csrf-token",
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_create_job_without_company_name_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "job_title": "Webエンジニア",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_job_without_job_title_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_job_with_invalid_status_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "status": "invalid-status",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_job_with_invalid_employment_type_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "employment_type": "invalid-type",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_job_with_negative_salary_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "salary_min": -1,
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_job_with_invalid_salary_range_returns_validation_error(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "salary_min": 6000000,
            "salary_max": 4000000,
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
