from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.user import User
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
