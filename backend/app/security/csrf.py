import hashlib
import hmac
import secrets

from ..config import get_settings


def create_csrf_token(user_id: str) -> str:
    settings = get_settings()

    nonce = secrets.token_urlsafe(32)

    message = f"{user_id}.{nonce}".encode()
    signature = hmac.new(
        settings.jwt_secret_key.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()

    return f"{nonce}.{signature}"


def verify_csrf_token(
    token: str,
    user_id: str,
) -> bool:
    settings = get_settings()

    try:
        nonce, signature = token.rsplit(".", 1)
    except ValueError:
        return False

    message = f"{user_id}.{nonce}".encode()

    expected_signature = hmac.new(
        settings.jwt_secret_key.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        signature,
        expected_signature,
    )
