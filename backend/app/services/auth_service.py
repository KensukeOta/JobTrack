from sqlmodel import Session, select

from ..models.user import User
from ..schemas.user import UserCreate
from ..security.password import hash_password, verify_dummy_password, verify_password


def get_user_by_email(
    session: Session,
    email: str,
) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def create_user(
    session: Session,
    user_create: UserCreate,
) -> User:
    user = User(
        name=user_create.name,
        email=str(user_create.email),
        password_hash=hash_password(user_create.password),
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def authenticate_user(
    session: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        session,
        email,
    )

    if user is None:
        verify_dummy_password(password)
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user
