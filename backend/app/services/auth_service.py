import bcrypt
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.utils.token import create_access_token


class EmailAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


async def signup_user(db: Session, name: str, email: str, password: str) -> str:
    normalized_email = email.strip().lower()

    existing_user = await run_in_threadpool(UserRepository.get_by_email, db, normalized_email)
    if existing_user:
        raise EmailAlreadyExistsError("Email already exists")

    hashed_password = await run_in_threadpool(_hash_password, password)
    created_user = await run_in_threadpool(
        UserRepository.create_user,
        db,
        name.strip(),
        normalized_email,
        hashed_password,
    )
    return create_access_token(str(created_user.id))


async def login_user(db: Session, email: str, password: str) -> str:
    normalized_email = email.strip().lower()
    existing_user = await run_in_threadpool(UserRepository.get_by_email, db, normalized_email)

    if not existing_user:
        raise InvalidCredentialsError("Invalid email or password")

    is_password_valid = await run_in_threadpool(
        _verify_password,
        password,
        existing_user.password,
    )
    if not is_password_valid:
        raise InvalidCredentialsError("Invalid email or password")

    return create_access_token(str(existing_user.id))
