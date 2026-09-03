import uuid

import pytest
from fastapi import HTTPException

from app.dependencies.csrf import verify_csrf
from app.models.user import User
from app.security.csrf import create_csrf_token, verify_csrf_token


def test_create_csrf_token_can_be_verified() -> None:
    user_id = "11111111-1111-1111-1111-111111111111"

    token = create_csrf_token(user_id)

    assert verify_csrf_token(
        token=token,
        user_id=user_id,
    )


def test_csrf_token_cannot_be_used_for_another_user() -> None:
    token = create_csrf_token(
        "11111111-1111-1111-1111-111111111111",
    )

    assert not verify_csrf_token(
        token=token,
        user_id="22222222-2222-2222-2222-222222222222",
    )


def test_tampered_csrf_token_is_rejected() -> None:
    user_id = "11111111-1111-1111-1111-111111111111"

    token = create_csrf_token(user_id)

    nonce, signature = token.rsplit(".", 1)

    replacement = "0" if signature[-1] != "0" else "1"
    tampered_signature = f"{signature[:-1]}{replacement}"

    assert not verify_csrf_token(
        token=f"{nonce}.{tampered_signature}",
        user_id=user_id,
    )


def test_malformed_csrf_token_is_rejected() -> None:
    assert not verify_csrf_token(
        token="invalid-token",
        user_id="11111111-1111-1111-1111-111111111111",
    )


def test_verify_csrf_accepts_valid_token() -> None:
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com",
        password_hash="dummy",
    )

    token = create_csrf_token(
        user_id=str(user.id),
    )

    verify_csrf(
        current_user=user,
        csrf_cookie=token,
        csrf_header=token,
    )


def test_verify_csrf_rejects_missing_cookie() -> None:
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com",
        password_hash="dummy",
    )

    token = create_csrf_token(
        user_id=str(user.id),
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_csrf(
            current_user=user,
            csrf_cookie=None,
            csrf_header=token,
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "CSRFトークンが無効です。"


def test_verify_csrf_rejects_missing_header() -> None:
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com",
        password_hash="dummy",
    )

    token = create_csrf_token(
        user_id=str(user.id),
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_csrf(
            current_user=user,
            csrf_cookie=token,
            csrf_header=None,
        )

    assert exc_info.value.status_code == 403


def test_verify_csrf_rejects_mismatched_header() -> None:
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com",
        password_hash="dummy",
    )

    csrf_cookie = create_csrf_token(
        user_id=str(user.id),
    )

    csrf_header = create_csrf_token(
        user_id=str(user.id),
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_csrf(
            current_user=user,
            csrf_cookie=csrf_cookie,
            csrf_header=csrf_header,
        )

    assert exc_info.value.status_code == 403


def test_verify_csrf_rejects_token_for_another_user() -> None:
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com",
        password_hash="dummy",
    )

    token = create_csrf_token(
        user_id=str(uuid.uuid4()),
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_csrf(
            current_user=user,
            csrf_cookie=token,
            csrf_header=token,
        )

    assert exc_info.value.status_code == 403
