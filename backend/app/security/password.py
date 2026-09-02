from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

DUMMY_HASH = password_hash.hash("jobtrack-dummy-password")


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def verify_dummy_password(
    password: str,
) -> None:
    password_hash.verify(
        password,
        DUMMY_HASH,
    )
