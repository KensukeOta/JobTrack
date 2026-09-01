from sqlmodel import Session, select

from ..models.user import User
from ..schemas.user import UserCreate
from ..security.password import hash_password


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
