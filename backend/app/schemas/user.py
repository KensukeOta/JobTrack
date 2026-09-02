import uuid

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(SQLModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(SQLModel):
    id: uuid.UUID
    name: str
    email: EmailStr
