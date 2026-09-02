import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.config import get_settings
from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import verify_password


def test_register_user(
    client: TestClient,
    session: Session,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data

    user = session.exec(select(User).where(User.email == "test@example.com")).first()

    assert user is not None
    assert user.password_hash != "password123"
    assert verify_password(
        "password123",
        user.password_hash,
    )


def test_register_duplicate_email_returns_conflict(
    client: TestClient,
) -> None:
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    }

    first_response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    second_response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert first_response.status_code == status.HTTP_201_CREATED
    assert second_response.status_code == status.HTTP_409_CONFLICT

    assert second_response.json() == {
        "detail": "このメールアドレスは既に登録されています。"
    }


def test_register_invalid_email_returns_unprocessable_entity(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "invalid-email",
            "password": "password123",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_register_short_password_returns_unprocessable_entity(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "short",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_register_empty_name_returns_unprocessable_entity(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_login_sets_access_token_cookie(
    client: TestClient,
) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert register_response.status_code == status.HTTP_201_CREATED

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert login_response.status_code == status.HTTP_200_OK

    data = login_response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "password" not in data
    assert "password_hash" not in data

    assert "access_token" in login_response.cookies


def test_login_with_wrong_password_returns_unauthorized(
    client: TestClient,
) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "メールアドレスまたはパスワードが正しくありません。"
    }

    assert "access_token" not in response.cookies


def test_login_with_unknown_email_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "unknown@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "メールアドレスまたはパスワードが正しくありません。"
    }

    assert "access_token" not in response.cookies


def test_login_access_token_contains_user_id(
    client: TestClient,
) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    user_id = register_response.json()["id"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    token = login_response.cookies.get("access_token")

    assert token is not None

    settings = get_settings()

    payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )

    assert payload["sub"] == user_id
    assert "exp" in payload

    uuid.UUID(payload["sub"])


def test_login_cookie_has_security_attributes(
    client: TestClient,
) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    set_cookie = response.headers["set-cookie"].lower()

    assert "access_token=" in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie
    assert "path=/" in set_cookie


def test_get_current_user(
    client: TestClient,
) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    user_id = register_response.json()["id"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert login_response.status_code == status.HTTP_200_OK

    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": user_id,
        "name": "Test User",
        "email": "test@example.com",
    }


def test_get_current_user_without_cookie_returns_unauthorized(
    client: TestClient,
) -> None:
    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "認証が必要です。",
    }


def test_get_current_user_with_invalid_token_returns_unauthorized(
    client: TestClient,
) -> None:
    client.cookies.set(
        "access_token",
        "invalid-token",
    )

    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "認証が必要です。",
    }


def test_get_current_user_with_unknown_user_returns_unauthorized(
    client: TestClient,
) -> None:
    unknown_user_id = uuid.uuid4()

    token = create_access_token(
        subject=str(unknown_user_id),
    )

    client.cookies.set(
        "access_token",
        token,
    )

    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "認証が必要です。",
    }


def test_get_current_user_with_expired_token_returns_unauthorized(
    client: TestClient,
) -> None:
    settings = get_settings()

    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "exp": datetime.now(UTC) - timedelta(minutes=1),
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    client.cookies.set(
        "access_token",
        token,
    )

    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "認証が必要です。",
    }
