import uuid

import pytest
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


def create_test_job(
    client: TestClient,
    csrf_token: str,
    *,
    company_name: str = "株式会社Example",
    job_title: str = "Webエンジニア",
    job_status: str = "interested",
) -> dict:
    response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": csrf_token,
        },
        json={
            "company_name": company_name,
            "job_title": job_title,
            "status": job_status,
        },
    )

    assert response.status_code == status.HTTP_201_CREATED

    return response.json()


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


def test_list_jobs_returns_empty_list(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.get("/api/v1/jobs")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "items": [],
        "total": 0,
        "page": 1,
        "page_size": 20,
    }


def test_list_jobs(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Alpha",
        job_title="バックエンドエンジニア",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Beta",
        job_title="データサイエンティスト",
    )

    response = client.get("/api/v1/jobs")

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 2
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert len(data["items"]) == 2

    company_names = {item["company_name"] for item in data["items"]}

    assert company_names == {
        "株式会社Alpha",
        "株式会社Beta",
    }


def test_list_jobs_only_returns_current_users_jobs(
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
    )

    response = client.get("/api/v1/jobs")

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["company_name"] == "株式会社UserB"
    assert data["items"][0]["user_id"] == user_b["user"]["id"]


def test_list_jobs_filters_by_company_name(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社OpenAI",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Example",
    )

    response = client.get(
        "/api/v1/jobs",
        params={"q": "OpenAI"},
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["company_name"] == "株式会社OpenAI"


def test_list_jobs_filters_by_job_title(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        job_title="データサイエンティスト",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Another",
        job_title="フロントエンドエンジニア",
    )

    response = client.get(
        "/api/v1/jobs",
        params={"q": "データ"},
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["job_title"] == "データサイエンティスト"


def test_list_jobs_filters_by_status(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Interested",
        job_status="interested",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Interview",
        job_status="interview",
    )

    response = client.get(
        "/api/v1/jobs",
        params={"status": "interview"},
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["status"] == "interview"


def test_list_jobs_combines_search_and_status_filters(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社DataOne",
        job_title="データサイエンティスト",
        job_status="interview",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社DataTwo",
        job_title="データエンジニア",
        job_status="interested",
    )

    response = client.get(
        "/api/v1/jobs",
        params={
            "q": "データ",
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["company_name"] == "株式会社DataOne"


def test_list_jobs_pagination(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    for index in range(5):
        create_test_job(
            client,
            auth["csrf_token"],
            company_name=f"株式会社{index}",
        )

    response = client.get(
        "/api/v1/jobs",
        params={
            "page": 2,
            "page_size": 2,
        },
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["total"] == 5
    assert data["page"] == 2
    assert data["page_size"] == 2
    assert len(data["items"]) == 2


def test_list_jobs_sorts_by_created_at_ascending(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社First",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Second",
    )

    response = client.get(
        "/api/v1/jobs",
        params={
            "sort": "created_at",
            "order": "asc",
        },
    )

    assert response.status_code == status.HTTP_200_OK

    items = response.json()["items"]

    created_at_values = [item["created_at"] for item in items]

    assert created_at_values == sorted(created_at_values)


def test_list_jobs_sorts_by_created_at_descending(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社First",
    )

    create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Second",
    )

    response = client.get(
        "/api/v1/jobs",
        params={
            "sort": "created_at",
            "order": "desc",
        },
    )

    assert response.status_code == status.HTTP_200_OK

    items = response.json()["items"]

    created_at_values = [item["created_at"] for item in items]

    assert created_at_values == sorted(
        created_at_values,
        reverse=True,
    )


@pytest.mark.parametrize(
    "params",
    [
        {"status": "invalid"},
        {"sort": "invalid"},
        {"order": "invalid"},
        {"page": 0},
        {"page_size": 0},
        {"page_size": 101},
    ],
)
def test_list_jobs_rejects_invalid_query_parameters(
    client: TestClient,
    params: dict[str, str | int],
) -> None:
    register_and_login(client)

    response = client.get(
        "/api/v1/jobs",
        params=params,
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_list_jobs_without_authentication_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.get("/api/v1/jobs")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_job(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    job = create_test_job(
        client,
        auth["csrf_token"],
        company_name="株式会社Example",
        job_title="データサイエンティスト",
    )

    response = client.get(
        f"/api/v1/jobs/{job['id']}",
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["id"] == job["id"]
    assert data["user_id"] == auth["user"]["id"]
    assert data["company_name"] == "株式会社Example"
    assert data["job_title"] == "データサイエンティスト"


def test_get_nonexistent_job_returns_not_found(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.get(
        "/api/v1/jobs/11111111-1111-1111-1111-111111111111",
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {
        "detail": "求人応募が見つかりません。",
    }


def test_get_other_users_job_returns_not_found(
    client: TestClient,
) -> None:
    user_a = register_and_login(
        client,
        email="user-a@example.com",
    )

    job_a = create_test_job(
        client,
        user_a["csrf_token"],
        company_name="株式会社UserA",
    )

    client.post("/api/v1/auth/logout")

    register_and_login(
        client,
        email="user-b@example.com",
    )

    response = client.get(
        f"/api/v1/jobs/{job_a['id']}",
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {
        "detail": "求人応募が見つかりません。",
    }


def test_get_job_with_invalid_uuid_returns_validation_error(
    client: TestClient,
) -> None:
    register_and_login(client)

    response = client.get(
        "/api/v1/jobs/not-a-uuid",
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_get_job_without_authentication_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/v1/jobs/11111111-1111-1111-1111-111111111111",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_job_single_field(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    job = create_test_job(
        client,
        auth["csrf_token"],
    )

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["status"] == "interview"
    assert data["company_name"] == job["company_name"]
    assert data["job_title"] == job["job_title"]


def test_update_job_multiple_fields(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    job = create_test_job(
        client,
        auth["csrf_token"],
    )

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Updated",
            "job_title": "データエンジニア",
            "status": "interview",
            "memo": "更新後のメモ",
        },
    )

    assert response.status_code == status.HTTP_200_OK

    data = response.json()

    assert data["company_name"] == "株式会社Updated"
    assert data["job_title"] == "データエンジニア"
    assert data["status"] == "interview"
    assert data["memo"] == "更新後のメモ"


def test_update_job_can_clear_nullable_field(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "memo": "削除予定のメモ",
        },
    )

    assert create_response.status_code == status.HTTP_201_CREATED

    job = create_response.json()

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "memo": None,
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["memo"] is None


@pytest.mark.parametrize(
    "payload",
    [
        {"company_name": None},
        {"job_title": None},
    ],
)
def test_update_job_rejects_null_required_fields(
    client: TestClient,
    payload: dict[str, None],
) -> None:
    auth = register_and_login(client)
    job = create_test_job(client, auth["csrf_token"])

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json=payload,
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_job_rejects_invalid_salary_range_with_existing_value(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "salary_min": 4000000,
            "salary_max": 6000000,
        },
    )

    job = create_response.json()

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "salary_min": 7000000,
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_job_rejects_invalid_salary_max_with_existing_value(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    create_response = client.post(
        "/api/v1/jobs",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "company_name": "株式会社Example",
            "job_title": "Webエンジニア",
            "salary_min": 4000000,
            "salary_max": 6000000,
        },
    )

    job = create_response.json()

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "salary_max": 3000000,
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_job_rejects_invalid_status(
    client: TestClient,
) -> None:
    auth = register_and_login(client)
    job = create_test_job(client, auth["csrf_token"])

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "status": "invalid",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_job_without_csrf_returns_forbidden(
    client: TestClient,
) -> None:
    auth = register_and_login(client)
    job = create_test_job(client, auth["csrf_token"])

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_update_nonexistent_job_returns_not_found(
    client: TestClient,
) -> None:
    auth = register_and_login(client)

    response = client.patch(
        "/api/v1/jobs/11111111-1111-1111-1111-111111111111",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_other_users_job_returns_not_found(
    client: TestClient,
) -> None:
    user_a = register_and_login(
        client,
        email="user-a@example.com",
    )

    job_a = create_test_job(
        client,
        user_a["csrf_token"],
    )

    client.post("/api/v1/auth/logout")

    user_b = register_and_login(
        client,
        email="user-b@example.com",
    )

    response = client.patch(
        f"/api/v1/jobs/{job_a['id']}",
        headers={
            "X-CSRF-Token": user_b["csrf_token"],
        },
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_job_without_authentication_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.patch(
        "/api/v1/jobs/11111111-1111-1111-1111-111111111111",
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_job_changes_updated_at(
    client: TestClient,
) -> None:
    auth = register_and_login(client)
    job = create_test_job(client, auth["csrf_token"])

    response = client.patch(
        f"/api/v1/jobs/{job['id']}",
        headers={
            "X-CSRF-Token": auth["csrf_token"],
        },
        json={
            "status": "interview",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["updated_at"] != job["updated_at"]
